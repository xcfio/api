import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, User } from "../../type"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { or, ilike } from "drizzle-orm"
import { main } from "../../"

export function SearchUsers(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/search/users",
        schema: {
            description: "Search for users by username or email",
            tags: ["Search"],
            querystring: Type.Object({
                query: Type.String({ minLength: 1, description: "Search query" }),
                limit: Type.Optional(
                    Type.Number({ minimum: 1, maximum: 100, default: 10, description: "Results limit" })
                )
            }),
            response: {
                200: Type.Array(User, {
                    description: "Array of users matching the search query",
                    minItems: 1,
                    maxItems: 100
                }),
                400: ErrorResponse(400, "Bad request - search query is required"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { query, limit = 10 } = request.query
                const searchQuery = query.trim()

                if (!searchQuery) {
                    throw CreateError(400, "INVALID_QUERY", "Search query cannot be empty")
                }

                const searchPattern = `%${searchQuery}%`
                const users = await db
                    .select()
                    .from(table.user)
                    .where(
                        or(
                            ilike(table.user.username, searchPattern),
                            ilike(table.user.email, searchPattern),
                            ilike(table.user.name, searchPattern)
                        )
                    )
                    .limit(limit)

                if (!users.length) throw CreateError(404, "USERS_NOT_FOUND", "Users not found")
                return reply.status(200).send(
                    users.map((user) => ({
                        ...user,
                        createdAt: user.createdAt.toISOString(),
                        updatedAt: user.updatedAt.toISOString()
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
