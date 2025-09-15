import { drizzle } from "drizzle-orm/postgres-js"
import { routine } from "./routine"
import postgres from "postgres"

export const db = drizzle({ client: postgres(process.env.DATABASE_URI) })
export const table = { routine } as const
