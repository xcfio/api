import { ErrorResponse } from "./type"
import { post } from "./post"
import { put } from "./put"
import fn from "../"

export default function Routine(fastify: Awaited<ReturnType<typeof fn>>) {
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
}
