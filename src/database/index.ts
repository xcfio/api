import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

export const db = drizzle({ client: postgres(process.env.URI) })

export const table = {} as const
