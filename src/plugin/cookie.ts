import Cookie from "@fastify/cookie"
import { main } from "../"

export default async function cookie(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(Cookie, { secret: process.env.COOKIE_SECRET })
}
