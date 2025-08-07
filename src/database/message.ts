import { pgTable, uuid, text, timestamp, check, char, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { v7 } from "uuid"

export const message = pgTable(
    "message",
    {
        id: uuid("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => v7()),
        key: char("key", { length: 128 }).notNull(),
        message: text("message").notNull(),
        one_time: boolean("one_time").default(false),
        expires: timestamp("expires", { mode: "date" })
    },
    (table) => [check("key_length", sql`length(${table.key}) = 128`)]
)
