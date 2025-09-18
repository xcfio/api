import { Conversation, ErrorResponse, JWTPayload } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { eq } from "drizzle-orm"
import { main } from "../../"

export function GetConversationId(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id",
        schema: {
            description: "Get specific conversation details",
            tags: ["Conversations"],
            params: Type.Object({
                id: Type.String({ format: "uuid", description: "Id of the conversation" })
            }),
            response: {
                200: Conversation,
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not a participant in this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id: conversationId } = request.params
                const currentUserId = request.user as JWTPayload

                if (!currentUserId) {
                    throw CreateError(401, "UNAUTHORIZED", "User authentication required")
                }

                const [conversation] = await db
                    .select()
                    .from(table.conversation)
                    .where(eq(table.conversation.id, conversationId))
                    .limit(1)

                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const isParticipant = conversation.p1 === currentUserId.id || conversation.p2 === currentUserId.id

                if (!isParticipant) {
                    throw CreateError(403, "FORBIDDEN", "Not authorized to access this conversation")
                }

                return reply.status(200).send({
                    ...conversation,
                    createdAt: conversation.createdAt.toISOString(),
                    updatedAt: conversation.updatedAt.toISOString()
                })
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.error("Error fetching conversation:", error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
