import { ErrorResponse } from "../type"
import { auth } from "./auth"
import fn from "../"

export default function xcfbot(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({
        method: "POST",
        url: "/xcfbot/auth",
        schema: {
            // body: {
            //     type: "object",
            //     required: ["id", "key"],
            //     properties: {
            //         id: { type: "string" },
            //         key: { type: "string" }
            //     }
            // },
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse
                // 200: {
                //     type: "object",
                //     properties: {
                //         id: { type: "string" },
                //         message: { type: "string" }
                //     }
                // }
            }
        },
        handler: auth
    })
}
