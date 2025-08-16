declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            SECRET: string
            REDIS_URI: string
            DATABASE_URI: string
        }
    }
}
