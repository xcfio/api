import { ErrorResponse, JWTPayload, Message } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { db, table } from "../../database"
import { eq, and, or } from "drizzle-orm"
import { Type } from "typebox"
import { main } from "../../"

export default function SendMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id/messages",
        schema: {
            description: "Send a new message to a conversation",
            tags: ["Messages"],
            params: Type.Object({
                id: Type.String({ format: "uuid", description: "Id of the conversation" })
            }),
            body: Type.Object({
                content: Type.String({ minLength: 1, maxLength: 2000, description: "Message content" })
            }),
            response: {
                201: Message,
                400: ErrorResponse(400, "Bad request - invalid message content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - conversation not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id: userId } = request.user as JWTPayload
                const { id: conversationId } = request.params
                const { content } = request.body

                const trimmedContent = content.trim()
                if (!trimmedContent) {
                    throw CreateError(400, "INVALID_CONTENT", "Message content cannot be empty")
                }

                const [conversation] = await db
                    .select()
                    .from(table.conversation)
                    .where(
                        and(
                            eq(table.conversation.id, conversationId),
                            or(eq(table.conversation.p1, userId), eq(table.conversation.p2, userId))
                        )
                    )
                    .limit(1)

                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const [message] = await db
                    .insert(table.message)
                    .values({ content: trimmedContent, sender: userId, conversation: conversation.id, status: "sent" })
                    .returning()

                await db
                    .update(table.conversation)
                    .set({ updatedAt: new Date() })
                    .where(eq(table.conversation.id, conversationId))

                if (fastify.io) {
                    const receiver = conversation.p1 === userId ? conversation.p2 : conversation.p1
                    fastify.io.to(receiver).emit("new_message", {
                        id: message.id,
                        content: message.content,
                        sender: message.sender,
                        conversation: message.conversation,
                        status: message.status,
                        createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
                        editedAt: message.editedAt?.toISOString() ?? null
                    })
                }

                return reply.code(201).send({
                    id: message.id,
                    content: message.content,
                    sender: message.sender,
                    conversation: message.conversation,
                    status: message.status,
                    createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
                    editedAt: message.editedAt?.toISOString() ?? null
                })
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
