import RateLimit from "@fastify/rate-limit"
import Cors from "@fastify/cors"
import Fastify from "fastify"
import Redis from "ioredis"
import { post, put } from "./routine"
import hostname from "../allowed-hostname.json"

export default async () => {
    const fastify = Fastify({ logger: process.env.NODE_ENV === "development" ? { file: "./log.json" } : true })

    const { REDIS_URI } = process.env
    if (REDIS_URI) {
        await fastify.register(RateLimit, { max: 10, timeWindow: 60000, redis: new Redis(REDIS_URI) })
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

    const ErrorResponse = {
        type: "object",
        required: ["error"],
        properties: {
            statusCode: { type: "number" },
            error: { type: "string" },
            message: { type: "string" }
        }
    }

    /* CNPI Routine section */
    const ClassSchedule = {
        type: "object",
        properties: {
            time: { type: "string" },
            subject: { type: "string" },
            teacher: { type: "string" },
            classroom: { type: "string" }
        }
    }

    const DailySchedule = {
        type: "object",
        properties: {
            "1": ClassSchedule,
            "2": ClassSchedule,
            "3": ClassSchedule,
            "4": ClassSchedule,
            "5": ClassSchedule,
            "6": ClassSchedule,
            "7": ClassSchedule
        }
    }

    fastify.route({
        method: "POST",
        url: "/routine",
        schema: {
            body: {
                type: "object",
                required: ["year", "semester", "department", "shift"],
                properties: {
                    year: { type: "string" },
                    department: { type: "string" },
                    semester: { type: "string" },
                    shift: { type: "string" },
                    group: { type: "string" }
                }
            },
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse,
                200: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        load: { type: "string" },
                        class: {
                            type: "object",
                            properties: {
                                Sunday: DailySchedule,
                                Monday: DailySchedule,
                                Tuesday: DailySchedule,
                                Wednesday: DailySchedule,
                                Thursday: DailySchedule
                            }
                        },
                        teacher: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    designation: { type: "string" },
                                    mobile: { type: "string" },
                                    subject: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: post
    })

    fastify.route({
        method: "PUT",
        url: "/routine",
        schema: {
            querystring: {
                type: "object",
                required: ["key"],
                properties: {
                    key: { type: "string" },
                    year: { type: "string" }
                }
            },
            body: {
                type: "object",
                properties: {
                    code: { type: "string" },
                    load: { type: "string" },
                    class: {
                        type: "object",
                        properties: {
                            Sunday: DailySchedule,
                            Monday: DailySchedule,
                            Tuesday: DailySchedule,
                            Wednesday: DailySchedule,
                            Thursday: DailySchedule
                        }
                    },
                    teacher: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                designation: { type: "string" },
                                mobile: { type: "string" },
                                subject: { type: "string" }
                            }
                        }
                    }
                }
            },
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse,
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        message: { type: "string" }
                    }
                }
            }
        },
        handler: put
    })

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
