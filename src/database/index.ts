import { drizzle } from "drizzle-orm/postgres-js"
import { conversation } from "./conversation"
import { message } from "./message"
import { user } from "./user"
import postgres from "postgres"

export const db = drizzle({ client: postgres(process.env.CA_DATABASE_URI) })
export const table = { conversation, message, user } as const
