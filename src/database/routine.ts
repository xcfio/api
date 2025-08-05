import { pgTable, uuid, varchar, jsonb, check } from "drizzle-orm/pg-core"
import { RoutineData } from "../type"
import { sql } from "drizzle-orm"
import { v7 } from "uuid"

export const routine = pgTable(
    "routine",
    {
        id: uuid("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => v7()),
        year: varchar("year", { length: 4 })
            .notNull()
            .$defaultFn(() => new Date().getFullYear().toString()),
        code: varchar("code", { length: 6 }).notNull(),
        load: varchar("load").notNull(),
        class: jsonb("class").$type<RoutineData["class"]>().notNull(),
        teacher: jsonb("teacher").$type<RoutineData["teacher"]>().notNull()
    },
    (table) => [check("code_pattern", sql`${table.code} ~ '^(67|68|69|72|85|92)-[1-7][AB][12]$'`)]
)
