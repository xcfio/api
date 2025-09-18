import { ErrorResponse, JWTPayload, User } from "../../type"
import { CreateError, isFastifyError } from "../../function"
import { db, table } from "../../database"
import { main } from "../../"
import { eq } from "drizzle-orm"

export default function SessionMe(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/auth/me",
        schema: {
            description: "Get current authenticated user",
            tags: ["Sessions"],
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
                const user = (request as any).user as JWTPayload
                const userData = await db.select().from(table.user).where(eq(table.user.id, user.id)).limit(1)

                if (!userData.length) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                const currentUser = userData[0]

                return reply.send({
                    id: currentUser.id,
                    email: currentUser.email,
                    username: currentUser.username,
                    name: currentUser.name,
                    avatar: currentUser.avatar,
                    createdAt: currentUser.createdAt?.toISOString()
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
