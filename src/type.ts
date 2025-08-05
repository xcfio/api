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

export type RoutineData = {
    code: `${"67" | "68" | "69" | "72" | "85" | "92"}-${"1" | "2" | "3" | "4" | "5" | "6" | "7"}${"A" | "B"}${
        | "1"
        | "2"}`
    load: string
    class: {
        [day in "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday"]: {
            [period in "1" | "2" | "3" | "4" | "5" | "6" | "7"]: {
                time: string
                subject: string
                teacher: string
                classroom: string
            }
        }
    }
    teacher: Array<{
        name: string
        designation: string
        mobile: string
        subject: string
    }>
}
