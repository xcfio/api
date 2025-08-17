declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            DATABASE_URI: string
            SECRET: string
        }
    }
}

export const ErrorResponse = {
    type: "object",
    required: ["error"],
    properties: {
        statusCode: { type: "number" },
        error: { type: "string" },
        message: { type: "string" }
    }
}
