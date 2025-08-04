declare global {
    namespace NodeJS {
        interface ProcessEnv {
            URI: string
            SECRET: string
            REDIS_HOST: string
            REDIS_PORT: string
            REDIS_USERNAME: string
            REDIS_PASSWORD: string
        }
    }
}
