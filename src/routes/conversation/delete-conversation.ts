import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, JWTPayload } from "../../type"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { eq } from "drizzle-orm"
import { main } from "../../"

export function DeleteConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "DELETE",
        url: "/conversations/:id",
        schema: {
            description: "Delete a conversation",
            tags: ["Conversations"],
            params: Type.Object({
                id: Type.String({ format: "uuid", description: "Id of the conversation" })
            }),
            response: {
                200: Type.Object(
                    {
                        success: Type.Boolean({ description: "Indicates if conversation is deleted" }),
                        message: Type.String({ description: "Confirmation message of deleted conversation" })
                    },
                    {
                        description: "Response schema for deleting conversation"
                    }
                ),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not authorized to delete this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const user = request.user as JWTPayload

                const [existingConversation] = await db
                    .select()
                    .from(table.conversation)
                    .where(eq(table.conversation.id, id))
                    .limit(1)

                if (!existingConversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                if (existingConversation.p1 !== user.id && existingConversation.p2 !== user.id) {
                    throw CreateError(403, "FORBIDDEN", "Not authorized to delete this conversation")
                }

                const deletedRows = await db.delete(table.conversation).where(eq(table.conversation.id, id)).returning()
                if (deletedRows.length === 0) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                return reply.status(200).send({
                    success: true,
                    message: "Conversation deleted successfully"
                })
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.error("Error deleting conversation:", error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
