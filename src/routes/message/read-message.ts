import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse } from "../../type"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { eq } from "drizzle-orm"
import { main } from "../../"

export default function ReadMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "PUT",
        url: "/messages/:id/read",
        schema: {
            description: "Mark a message as read",
            tags: ["Messages"],
            params: Type.Object({
                id: Type.String({ format: "uuid", description: "Id of the message" })
            }),
            response: {
                200: Type.Object(
                    {
                        success: Type.Boolean({ description: "Indicates if message marked as read successfully" }),
                        message: Type.String({ description: "Confirmation message" })
                    },
                    {
                        description: "Response schema for marking message as read"
                    }
                ),
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

                const [{ message, conversation }] = await db
                    .select()
                    .from(table.message)
                    .leftJoin(table.conversation, eq(table.conversation.id, table.message.conversation))
                    .where(eq(table.message.id, id))
                    .limit(1)

                if (!message || !conversation) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (message.status === "read") {
                    return reply.code(200).send({
                        success: true,
                        message: "Message is already marked as read"
                    })
                }

                if (message.status === "deleted") {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                await db.update(table.message).set({ status: "read" }).where(eq(table.message.id, id))

                return reply.code(200).send({
                    success: true,
                    message: "Message marked as read successfully"
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
