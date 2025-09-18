import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, JWTPayload } from "../../type"
import { db, table } from "../../database"
import { main } from "../../"
import { Type, Static } from "@sinclair/typebox"
import { randomBytes } from "node:crypto"

export const GitHubUserSchema = Type.Object({
    id: Type.Number(),
    login: Type.String(),
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    avatar_url: Type.Optional(Type.String()),
    bio: Type.Optional(Type.String()),
    company: Type.Optional(Type.String()),
    location: Type.Optional(Type.String()),
    blog: Type.Optional(Type.String()),
    html_url: Type.String(),
    public_repos: Type.Optional(Type.Number()),
    public_gists: Type.Optional(Type.Number()),
    followers: Type.Optional(Type.Number()),
    following: Type.Optional(Type.Number()),
    created_at: Type.Optional(Type.String()),
    updated_at: Type.Optional(Type.String())
})

export default function AuthGitHub(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/auth/github",
        schema: {
            description: "Initiate GitHub OAuth login",
            tags: ["Authentication"],
            response: {
                302: Type.Object(
                    {
                        message: Type.String({ description: "Redirect message" })
                    },
                    {
                        description: "Redirect to Google OAuth authorization page"
                    }
                ),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        handler: async (_, reply) => {
            try {
                const state = randomBytes(32).toString("hex")

                const githubAuthUrl = [
                    `https://github.com/login/oauth/authorize?`,
                    `client_id=${process.env.GITHUB_CLIENT_ID}&`,
                    `redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || "http://localhost:7200/auth/github/callback")}&`,
                    `scope=user:email&`,
                    `state=${state}&`,
                    `allow_signup=true`
                ]

                reply.setCookie("github_oauth_state", state, {
                    signed: true,
                    sameSite: "lax",
                    maxAge: 600,
                    path: "/"
                })

                return reply.redirect(githubAuthUrl.join(""))
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })

    fastify.route({
        method: "GET",
        url: "/auth/github/callback",
        schema: {
            description: "Handle GitHub OAuth callback",
            tags: ["Authentication"],
            querystring: Type.Object(
                {
                    code: Type.Optional(Type.String({ description: "Authorization code from GitHub OAuth" })),
                    error: Type.Optional(Type.String({ description: "Error code if OAuth failed" })),
                    error_description: Type.Optional(Type.String({ description: "Human-readable error description" })),
                    state: Type.Optional(Type.String({ description: "CSRF protection state parameter" }))
                },
                {
                    description: "GitHub OAuth callback query parameters"
                }
            ),
            response: {
                302: Type.Object(
                    {
                        message: Type.String({ description: "OAuth callback response message" })
                    },
                    {
                        description: "Successful OAuth callback redirect"
                    }
                ),
                400: ErrorResponse(400, "Bad request - OAuth callback error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        handler: async (request, reply) => {
            try {
                const { code, error, state } = request.query

                if (error) {
                    console.error("GitHub OAuth error:", error)
                    reply.clearCookie("github_oauth_state", { path: "/" })
                    return reply.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`)
                }

                if (!code) {
                    reply.clearCookie("github_oauth_state", { path: "/" })
                    throw CreateError(400, "NO_AUTH_CODE", "Authorization code not provided")
                }

                const storedState = request.unsignCookie(request.cookies.github_oauth_state || "")
                if (!storedState.valid || storedState.value !== state) {
                    reply.clearCookie("github_oauth_state", { path: "/" })
                    throw CreateError(400, "INVALID_STATE", "Invalid state parameter")
                }

                reply.clearCookie("github_oauth_state", { path: "/" })

                const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        client_id: process.env.GITHUB_CLIENT_ID!,
                        client_secret: process.env.GITHUB_CLIENT_SECRET!,
                        code: code
                    })
                })

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json()
                    console.error("Token exchange failed:", errorData)
                    throw CreateError(400, "TOKEN_EXCHANGE_FAILED", "Failed to exchange authorization code")
                }

                const tokenData = (await tokenResponse.json()) as {
                    access_token: string
                    token_type: string
                    scope: string
                    error?: string
                    error_description?: string
                }

                if (tokenData.error) {
                    console.error("GitHub token error:", tokenData.error_description)
                    throw CreateError(400, "TOKEN_ERROR", tokenData.error_description || "Token exchange failed")
                }

                const userResponse = await fetch("https://api.github.com/user", {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                        "User-Agent": "YourApp/1.0"
                    }
                })

                if (!userResponse.ok) {
                    console.error("Failed to fetch user data from GitHub")
                    throw CreateError(400, "USER_FETCH_FAILED", "Failed to fetch user data")
                }

                const user = (await userResponse.json()) as Static<typeof GitHubUserSchema>

                let userEmail = user.email
                if (!userEmail) {
                    const emailResponse = await fetch("https://api.github.com/user/emails", {
                        headers: {
                            Authorization: `Bearer ${tokenData.access_token}`,
                            "User-Agent": "ChatApp/1.0"
                        }
                    })

                    if (emailResponse.ok) {
                        const emails = (await emailResponse.json()) as Array<{
                            email: string
                            primary: boolean
                            verified: boolean
                        }>

                        const primaryEmail = emails.find((e) => e.primary && e.verified)
                        userEmail = primaryEmail?.email
                    }
                }

                if (!userEmail) {
                    throw CreateError(400, "NO_EMAIL", "User email not found or not verified")
                }

                const values = {
                    type: "github",
                    token: tokenData.access_token,
                    email: userEmail,
                    username: user.login,
                    name: user.name || user.login,
                    avatar: user.avatar_url || `https://github.com/identicons/${user.login}.png`
                } as const

                const [data] = await db
                    .insert(table.user)
                    .values(values)
                    .onConflictDoUpdate({
                        target: table.user.email,
                        set: {
                            token: tokenData.access_token,
                            username: user.login,
                            name: user.name || user.login,
                            avatar: user.avatar_url || `https://github.com/identicons/${user.login}.png`
                        }
                    })
                    .returning()

                const payload: JWTPayload = {
                    ...({ ...data, createdAt: undefined, updatedAt: undefined, lastSeen: undefined } as any),
                    token: tokenData.access_token,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
                }

                const jwt = fastify.jwt.sign(payload)
                reply.setCookie("auth", jwt, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 7 * 24 * 60 * 60,
                    path: "/"
                })

                return reply.redirect(process.env.FRONTEND_URL ?? "http://localhost:7700")
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
