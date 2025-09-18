import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, User } from "../../type"
import { and, or, ilike, desc } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { main } from "../../"

export default function GetUserWithoutID(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/user",
        schema: {
            description: "Get list of all users",
            tags: ["Users"],
            querystring: Type.Object(
                {
                    page: Type.Optional(
                        Type.Integer({
                            description: "Page number for pagination",
                            default: 1,
                            minimum: 1
                        })
                    ),
                    limit: Type.Optional(
                        Type.Integer({
                            description: "Number of items per page",
                            maximum: 100,
                            minimum: 1
                        })
                    ),
                    search: Type.Optional(Type.String({ description: "Search by username or name" }))
                },
                {
                    description: "Query parameters for user listing"
                }
            ),
            response: {
                200: Type.Array(User, {
                    description: "Array of user objects matching the search criteria",
                    maxItems: 100,
                    minItems: 1
                }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - List not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20, search } = request.query
                const conditions = []

                if (search) {
                    const il1 = ilike(table.user.username, `%${search}%`)
                    const il2 = ilike(table.user.name, `%${search}%`)
                    conditions.push(or(il1, il2))
                }

                const whereClause = conditions.length > 0 ? and(...conditions) : undefined
                const offset = (page - 1) * limit

                const user = await db
                    .select()
                    .from(table.user)
                    .where(whereClause)
                    .orderBy(desc(table.user.createdAt))
                    .limit(limit)
                    .offset(offset)

                if (!user.length) throw CreateError(404, "PAGE_NOT_FOUND", "Page not found")
                return reply.status(200).send(user.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
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
