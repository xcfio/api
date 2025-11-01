import { CreateError, isFastifyError, ValidationErrorHandler } from "./function"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import { FastifyReply, FastifyRequest } from "fastify"
import { Value } from "typebox/value"
import { JWTPayload } from "./type"
import Fastify from "fastify"
import Routes from "./routes"
import Socket from "./socket"
import Plugin from "./plugin"
import Others from "./other"

export async function main() {
    const isDevelopment = process.env.NODE_ENV === "development"
    const fastify = Fastify({
        trustProxy: true,
        logger: {
            formatters: { level: (level, number) => ({ level: `${level} (${number})` }) },
            file: isDevelopment ? "./log.json" : undefined
        },
        schemaErrorFormatter: ValidationErrorHandler
    }).withTypeProvider<TypeBoxTypeProvider>()

    fastify.get("/status", { logLevel: "silent" }, (_, reply) => reply.code(200).send("OK"))
    await Plugin(fastify)

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (await request.jwtVerify()) as JWTPayload

            if (!Value.Check(JWTPayload, user)) {
                reply.clearCookie("auth", {
                    path: "/",
                    signed: true,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                })

                throw CreateError(401, "INVALID_TOKEN_PAYLOAD", "Invalid authentication token structure")
            }

            request.user = user
        } catch (error) {
            if (isFastifyError(error)) {
                if (
                    error.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE" ||
                    error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER"
                ) {
                    throw CreateError(401, "NO_TOKEN", "Authentication token not provided")
                }

                if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
                    throw CreateError(401, "TOKEN_EXPIRED", "Authentication token has expired")
                }

                if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
                    throw CreateError(401, "INVALID_TOKEN", "Invalid authentication token")
                }

                reply.clearCookie("auth", {
                    path: "/",
                    signed: true,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                })

                throw CreateError(401, "AUTHENTICATION_FAILED", "Authentication failed")
            } else {
                console.trace(error)
                throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
            }
        }
    })

    Routes(fastify)
    Others(fastify)
    fastify.get("/terms", () => "ToS?? Forget about it")
    fastify.addHook("onError", (_, reply, error) => {
        if ((Error.isError(error) && error.message.startsWith("Rate limit exceeded")) || isFastifyError(error)) {
            throw error
        } else {
            console.trace(error)
            return reply.code(500).send({ error: "Internal Server Error" })
        }
    })

    await fastify.listen({
        host: "RENDER" in process.env ? `0.0.0.0` : `localhost`,
        port: Number(process.env.PORT ?? 7200)
    })

    console.log(
        `Server listening at http://${"RENDER" in process.env ? `0.0.0.0` : `localhost`}:${Number(
            process.env.PORT ?? 7200
        )}`
    )
    fastify.io.on("connection", Socket(fastify))
    return fastify
}

main()
