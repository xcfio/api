import { Conversation, ErrorResponse, JWTPayload } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { db, table } from "../../database"
import { eq, and, or } from "drizzle-orm"
import { Type } from "@sinclair/typebox"
import { main } from "../../"

export function CreateConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id",
        schema: {
            description: "Create new conversation with another user",
            tags: ["Conversations"],
            params: Type.Object({
                id: Type.String({ format: "uuid", description: "Id of the user to start conversation with" })
            }),
            response: {
                201: Conversation,
                400: ErrorResponse(400, "Bad request - invalid user id or conversation already exists"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id: otherUserId } = request.params
                const user = request.user as JWTPayload

                if (user.id === otherUserId) {
                    throw CreateError(400, "INVALID_REQUEST", "Cannot create conversation with yourself")
                }

                const otherUser = await db
                    .select({ id: table.user.id })
                    .from(table.user)
                    .where(eq(table.user.id, otherUserId))
                    .limit(1)

                if (otherUser.length === 0) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }

                const existingConversation = await db
                    .select()
                    .from(table.conversation)
                    .where(
                        or(
                            and(eq(table.conversation.p1, user.id), eq(table.conversation.p2, otherUserId)),
                            and(eq(table.conversation.p1, otherUserId), eq(table.conversation.p2, user.id))
                        )
                    )
                    .limit(1)

                if (existingConversation.length > 0) {
                    throw CreateError(400, "CONVERSATION_EXISTS", "Conversation already exists between these users")
                }

                const [conversation] = await db
                    .insert(table.conversation)
                    .values({
                        p1: user.id,
                        p2: otherUserId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                    .returning()

                if (!conversation) {
                    throw CreateError(500, "CREATION_FAILED", "Failed to create conversation")
                }

                return reply.status(201).send({
                    ...conversation,
                    createdAt: conversation.createdAt.toISOString(),
                    updatedAt: conversation.updatedAt.toISOString()
                })
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.error("Error creating conversation:", error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
