import { ErrorResponse } from "../type"
import { auth } from "./routes/auth"
import fn from "../../src"

export default function xcfbot(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({
        method: "POST",
        url: "/xcfbot/auth",
        schema: {
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse
            }
        },
        handler: auth
    })
}
