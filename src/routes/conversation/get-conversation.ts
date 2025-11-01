import { Conversation, ErrorResponse, JWTPayload } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { eq, or, desc } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export function GetConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/conversations",
        schema: {
            description: "Get user's conversations list",
            tags: ["Conversations"],
            querystring: Type.Object({
                page: Type.Optional(Type.Number({ minimum: 1, default: 1, description: "Page number" })),
                limit: Type.Optional(
                    Type.Number({ minimum: 1, maximum: 100, default: 20, description: "Conversations per page" })
                )
            }),
            response: {
                200: Type.Array(Conversation, {
                    description: "Array of conversation objects for the authenticated user",
                    maxItems: 100,
                    minItems: 0
                }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number }
                const user = request.user as JWTPayload

                if (!user) {
                    throw CreateError(401, "UNAUTHORIZED", "User authentication required")
                }

                const offset = (page - 1) * limit
                const conversations = await db
                    .select()
                    .from(table.conversation)
                    .where(or(eq(table.conversation.p1, user.id), eq(table.conversation.p2, user.id)))
                    .orderBy(desc(table.conversation.updatedAt))
                    .limit(limit)
                    .offset(offset)

                return reply.status(200).send(
                    conversations.map((x) => ({
                        ...x,
                        createdAt: x.createdAt.toISOString(),
                        updatedAt: x.updatedAt.toISOString()
                    }))
                )
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.error("Error fetching conversations:", error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
