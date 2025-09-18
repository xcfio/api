import JTW from "@fastify/jwt"
import { main } from "../"

export default async function jwt(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(JTW, { cookie: { cookieName: "auth", signed: true }, secret: process.env.COOKIE_SECRET })
}
