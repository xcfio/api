import rl from "@fastify/rate-limit"
import Fastify from "fastify"
import Redis from "ioredis"

export default async () => {
    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
    })

    redis.on("error", (err) => {
        console.log("Redis error:", err)
    })

    const fastify = Fastify({ logger: true })
    await fastify.register(rl, { redis, max: 20, timeWindow: 60000 })

    fastify.get("/", () => "Success")
    fastify.get("/status", (_, reply) => reply.code(200).send({ status: "ok" }))

    return fastify
}
