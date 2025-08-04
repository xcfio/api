declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SECRET: string
        }
    }
}
