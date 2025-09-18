import { uuid, pgTable, timestamp } from "drizzle-orm/pg-core"
import { user } from "./user"
import { v7 } from "uuid"

export const conversation = pgTable("conversation", {
    id: uuid("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => v7()),
    p1: uuid("p1")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    p2: uuid("p2")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
        .defaultNow()
        .notNull()
        .$onUpdateFn(() => new Date())
})
