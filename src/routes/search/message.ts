import { ErrorResponse, JWTPayload, Message } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { and, or, ilike, eq, desc } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { main } from "../../"

export function SearchMessages(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/search/messages",
        schema: {
            description: "Search messages across conversations",
            tags: ["Search"],
            querystring: Type.Object({
                query: Type.String({ minLength: 1, description: "Search query" }),
                limit: Type.Optional(
                    Type.Number({ minimum: 1, maximum: 100, default: 20, description: "Results limit" })
                ),
                conversationId: Type.Optional(
                    Type.String({ format: "uuid", description: "Search within specific conversation" })
                )
            }),
            response: {
                200: Type.Array(Message, {
                    description: "Array of messages matching the search query",
                    minItems: 1,
                    maxItems: 100
                }),
                400: ErrorResponse(400, "Bad request - search query is required"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - access denied to conversation"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { query, limit = 20, conversationId } = request.query
                const { id } = request.user as JWTPayload

                const searchQuery = query.trim()
                if (!searchQuery) {
                    throw CreateError(400, "INVALID_QUERY", "Search query cannot be empty")
                }

                const searchPattern = `%${searchQuery}%`
                const whereConditions = [
                    ilike(table.message.content, searchPattern),
                    or(eq(table.conversation.p1, id), eq(table.conversation.p2, id))
                ]

                if (conversationId) {
                    const conversation = await db
                        .select({ id: table.conversation.id })
                        .from(table.conversation)
                        .where(
                            and(
                                eq(table.conversation.id, conversationId),
                                or(eq(table.conversation.p1, id), eq(table.conversation.p2, id))
                            )
                        )
                        .limit(1)

                    if (!conversation.length) {
                        throw CreateError(403, "ACCESS_DENIED", "You don't have access to this conversation")
                    }
                }

                const messages = await db
                    .select()
                    .from(table.message)
                    .leftJoin(table.conversation, eq(table.conversation.id, table.message.conversation))
                    .where(and(...whereConditions))
                    .orderBy(desc(table.message.createdAt))
                    .limit(limit)

                if (!messages.length) throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                return reply.status(200).send(
                    messages.map(({ message }) => ({
                        ...message,
                        createdAt: message.createdAt.toISOString(),
                        editedAt: message.editedAt?.toISOString() ?? null
                    }))
                )
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
