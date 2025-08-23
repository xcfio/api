import { Type } from "@sinclair/typebox"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            DATABASE_URI: string
            TOKEN: string
            CHANNEL: string
            SECRET: string
        }
    }
}

export const ErrorResponse = Type.Object({
    statusCode: Type.Number(),
    error: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Any())
})
