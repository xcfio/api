import swagger_ui from "./swagger-ui"
import socket from "./socket-io"
import swagger from "./swagger"
import cookie from "./cookie"
import rl from "./rate-limit"
import cors from "./cors"
import jwt from "./jwt"
import { main } from "../"

export default async function Plugin(fastify: Awaited<ReturnType<typeof main>>) {
    await rl(fastify)
    await swagger(fastify)
    await swagger_ui(fastify)
    await socket(fastify)
    await cookie(fastify)
    await jwt(fastify)
    await cors(fastify)
}
