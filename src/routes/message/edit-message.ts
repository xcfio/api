import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, JWTPayload } from "../../type"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { eq, and } from "drizzle-orm"
import { main } from "../../"

export default function EditMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "PATCH",
        url: "/messages/:id",
        schema: {
            description: "Edit a message",
            tags: ["Messages"],
            params: Type.Object({ id: Type.String({ format: "uuid", description: "Id of the message" }) }),
            body: Type.Object({
                content: Type.String({ minLength: 1, maxLength: 1000, description: "New content of the message" })
            }),
            response: {
                200: Type.Object(
                    {
                        success: Type.Boolean({ description: "Indicates if message is edited" }),
                        message: Type.String({ description: "Confirmation message of edited message" }),
                        data: Type.Object({
                            id: Type.String({ format: "uuid", description: "Unique identifier of the message" }),
                            content: Type.String({ description: "Updated content of the message" }),
                            editedAt: Type.String({
                                format: "date-time",
                                description: "Timestamp when the message was last edited"
                            })
                        })
                    },
                    {
                        description: "Response schema for editing operation"
                    }
                ),
                400: ErrorResponse(400, "Bad request - invalid content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const { content } = request.body
                const { id: userId } = request.user as JWTPayload

                const [{ message, conversation }] = await db
                    .select()
                    .from(table.message)
                    .leftJoin(table.conversation, eq(table.conversation.id, table.message.conversation))
                    .where(eq(table.message.id, id))
                    .limit(1)

                if (!message || !conversation) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (message.sender !== userId) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (message.status === "deleted") {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (message.content === content.trim()) {
                    return reply.code(200).send({
                        success: true,
                        message: "Message content is unchanged",
                        data: {
                            id: message.id,
                            content: message.content,
                            editedAt: new Date().toISOString()
                        }
                    })
                }

                const editedAt = new Date()
                await db
                    .update(table.message)
                    .set({
                        content: content.trim(),
                        editedAt: editedAt
                    })
                    .where(and(eq(table.message.id, id), eq(table.message.sender, userId)))

                if (fastify.io) {
                    const receiver = conversation.p1 === message.sender ? conversation.p2 : conversation.p1

                    fastify.io.to(receiver).emit("message_edited", {
                        messageId: id,
                        content: content.trim(),
                        editedAt: editedAt.toISOString(),
                        conversationId: conversation.id
                    })
                }

                return reply.code(200).send({
                    success: true,
                    message: "Message edited successfully",
                    data: {
                        id: id,
                        content: content.trim(),
                        editedAt: editedAt.toISOString()
                    }
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
