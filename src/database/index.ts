import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { routine } from "./routine"

export const db = drizzle({ client: postgres(process.env.DATABASE_URI) })

export const table = { routine } as const
