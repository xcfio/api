import { ErrorResponse } from "../type"
import { post } from "./post"
import { put } from "./put"
import fn from "../"

export default function Vaultly(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({
        method: "POST",
        url: "/vaultly",
        schema: {
            body: {
                type: "object",
                required: ["id", "key"],
                properties: {
                    id: { type: "string" },
                    key: { type: "string" }
                }
            },
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse,
                200: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        message: { type: "string" }
                    }
                }
            }
        },
        handler: post
    })

    fastify.route({
        method: "PUT",
        url: "/vaultly",
        schema: {
            body: {
                type: "object",
                required: ["key", "message"],
                properties: {
                    key: { type: "string" },
                    message: { type: "string" },
                    expires: { type: ["string", "null"] },
                    one_time: { type: "boolean" }
                }
            },
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse,
                200: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        message: { type: "string" },
                        expires: { type: ["string", "null"] },
                        one_time: { type: "boolean" }
                    }
                }
            }
        },
        handler: put
    })
}
