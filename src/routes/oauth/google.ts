import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, JWTPayload } from "../../type"
import { db, table } from "../../database"
import { main } from "../../"
import { Type, Static } from "@sinclair/typebox"
import { randomBytes } from "node:crypto"

export const GoogleUserSchema = Type.Object({
    id: Type.String(),
    email: Type.String(),
    verified_email: Type.Boolean(),
    name: Type.String(),
    given_name: Type.Optional(Type.String()),
    family_name: Type.Optional(Type.String()),
    picture: Type.Optional(Type.String()),
    locale: Type.Optional(Type.String())
})

export default function AuthGoogle(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/auth/google",
        schema: {
            description: "Initiate Google OAuth login",
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

                const googleAuthUrl = [
                    `https://accounts.google.com/o/oauth2/v2/auth?`,
                    `client_id=${process.env.GOOGLE_CLIENT_ID}&`,
                    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || "http://localhost:7200/auth/google/callback")}&`,
                    `response_type=code&`,
                    `scope=${encodeURIComponent("openid email profile")}&`,
                    `access_type=offline&`,
                    `include_granted_scopes=true&`,
                    `state=${state}`
                ]

                reply.setCookie("google_oauth_state", state, {
                    signed: true,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 600,
                    path: "/"
                })

                return reply.redirect(googleAuthUrl.join(""))
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
        url: "/auth/google/callback",
        schema: {
            description: "Handle Google OAuth callback",
            tags: ["Authentication"],
            querystring: Type.Object(
                {
                    code: Type.Optional(
                        Type.String({
                            description: "Authorization code from Google OAuth"
                        })
                    ),
                    error: Type.Optional(
                        Type.String({
                            description: "Error code if OAuth failed"
                        })
                    ),
                    error_description: Type.Optional(
                        Type.String({
                            description: "Human-readable error description"
                        })
                    ),
                    state: Type.Optional(
                        Type.String({
                            description: "CSRF protection state parameter"
                        })
                    ),
                    scope: Type.Optional(
                        Type.String({
                            description: "OAuth scopes granted by the user"
                        })
                    )
                },
                {
                    description: "Google OAuth callback query parameters"
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
                const { code, error, error_description, state } = request.query

                if (error) {
                    console.error("Google OAuth error:", error, error_description)
                    reply.clearCookie("google_oauth_state", { path: "/" })
                    return reply.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`)
                }

                if (!code) {
                    reply.clearCookie("google_oauth_state", { path: "/" })
                    throw CreateError(400, "NO_AUTH_CODE", "Authorization code not provided")
                }

                const storedState = request.unsignCookie(request.cookies.google_oauth_state || "")
                if (!storedState.valid || !state || storedState.value !== state) {
                    reply.clearCookie("google_oauth_state", { path: "/" })
                    throw CreateError(400, "INVALID_STATE", "Invalid or missing state parameter")
                }

                reply.clearCookie("google_oauth_state", { path: "/" })

                const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        client_id: process.env.GOOGLE_CLIENT_ID!,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                        code: code,
                        grant_type: "authorization_code",
                        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:7200/auth/google/callback"
                    })
                })

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json()
                    console.error("Google token exchange failed:", errorData)
                    throw CreateError(400, "TOKEN_EXCHANGE_FAILED", "Failed to exchange authorization code")
                }

                const tokenData = (await tokenResponse.json()) as {
                    access_token: string
                    refresh_token?: string
                    expires_in: number
                    token_type: string
                    scope: string
                    id_token: string
                }

                const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`
                    }
                })

                if (!userResponse.ok) {
                    console.error("Failed to fetch user data from Google")
                    throw CreateError(400, "USER_FETCH_FAILED", "Failed to fetch user data")
                }

                const user = (await userResponse.json()) as Static<typeof GoogleUserSchema>

                if (!user.email) {
                    throw CreateError(400, "NO_EMAIL", "User email not found")
                }

                if (!user.verified_email) {
                    throw CreateError(400, "EMAIL_NOT_VERIFIED", "User email is not verified")
                }

                const values = {
                    type: "google",
                    token: tokenData.refresh_token || tokenData.access_token,
                    email: user.email,
                    username: user.email.split("@")[0],
                    name: user.name,
                    avatar:
                        user.picture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4285f4&color=fff`
                } as const

                const [data] = await db
                    .insert(table.user)
                    .values(values)
                    .onConflictDoUpdate({
                        target: table.user.email,
                        set: {
                            token: tokenData.refresh_token || tokenData.access_token,
                            name: user.name,
                            avatar:
                                user.picture ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4285f4&color=fff`
                        }
                    })
                    .returning()

                const payload: JWTPayload = {
                    ...({ ...data, createdAt: undefined, updatedAt: undefined, lastSeen: undefined } as any),
                    token: tokenData.access_token,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + tokenData.expires_in
                }

                const jwt = fastify.jwt.sign(payload)
                reply.setCookie("auth", jwt, {
                    signed: true,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: tokenData.expires_in,
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
