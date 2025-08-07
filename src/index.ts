import hostname from "../allowed-hostname.json"
import RateLimit from "@fastify/rate-limit"
import Cors from "@fastify/cors"
import Fastify from "fastify"
import Redis from "ioredis"
import Routine from "./routine"
import Vaultly from "./vaultly"

export default async () => {
    const fastify = Fastify({
        trustProxy: true,
        logger: {
            formatters: { level: (level, number) => ({ level: `${level} (${number})` }) },
            file: process.env.NODE_ENV === "development" ? "./log.json" : undefined
        }
    })

    const { REDIS_URI } = process.env
    if (REDIS_URI) {
        await fastify.register(RateLimit, {
            max: 20,
            timeWindow: 60000,
            // redis: new Redis(REDIS_URI),
            keyGenerator: (req) => {
                const forwarded = req.headers["x-forwarded-for"]
                return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip
            }
        })
    } else {
        process.emitWarning("Redis is not configured, rate limiting will not be applied.")
    }

    await fastify.register(Cors, {
        methods: ["GET", "POST", "PUT"],
        origin: (origin, cb) => {
            if (!origin) return cb(null, true)
            if (hostname.includes(new URL(origin).hostname)) return cb(null, true)
            cb(new Error("Not allowed"), false)
        }
    })

    fastify.get("/", (_, reply) => reply.redirect("https://github.com/xcfio/api"))
    fastify.get("/status", (_, reply) => reply.code(200).send({ status: "ok" }))

    Routine(fastify)
    Vaultly(fastify)

    fastify.addHook("onError", (_, reply, error) => {
        if (error.code === "FST_ERR_VALIDATION") {
            reply.code(400).send({ statusCode: 400, error: "Bad Request", message: error.message })
            return
        }
        console.error(error)
        reply.code(500).send({ error: "Internal Server Error" })
    })

    return fastify
}
