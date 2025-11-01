import { uuid, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { MessageStatus } from "../type"
import { Static } from "typebox"
import { v7 } from "uuid"
import { conversation } from "./conversation"
import { user } from "./user"

export const message = pgTable("message", {
    id: uuid("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => v7()),
    content: text("content").notNull(),
    sender: uuid("sender")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    conversation: uuid("conversation")
        .notNull()
        .references(() => conversation.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("sent").$type<Static<typeof MessageStatus>>(),
    createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
    editedAt: timestamp("edited_at", { withTimezone: false })
})
