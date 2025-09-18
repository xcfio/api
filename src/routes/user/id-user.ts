import { CreateError, isFastifyError } from "../../function"
import { ErrorResponse, User } from "../../type"
import { db, table } from "../../database"
import { Type } from "@sinclair/typebox"
import { eq } from "drizzle-orm"
import { main } from "../../"

export default function GetUserWithID(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/user/:id",
        schema: {
            description: "Get specific user profile",
            tags: ["Users"],
            params: Type.Object({ id: Type.String({ format: "uuid", description: "Id of user" }) }),
            response: {
                200: User,
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const [user] = await db.select().from(table.user).where(eq(table.user.id, id))

                if (!user) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                return reply.status(200).send({ ...user, createdAt: user.createdAt.toISOString() })
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
