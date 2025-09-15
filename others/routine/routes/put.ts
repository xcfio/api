import { CreateError, isFastifyError } from "../../function"
import { FastifyRequest, FastifyReply } from "fastify"
import { RoutineData, PutQuery } from "../type"
import { Static } from "@sinclair/typebox"
import { db, table } from "../database"

export async function put(
    request: FastifyRequest<{ Querystring: Static<typeof PutQuery>; Body: Static<typeof RoutineData> }>,
    reply: FastifyReply
) {
    try {
        const routine = request.body
        const { key, year } = request.query

        if (key !== process.env.SECRET) throw CreateError(403, "FORBIDDEN", "Forbidden")

        const [result] = await db
            .insert(table.routine)
            .values({ ...routine, year })
            .returning()

        return reply.code(201).send({ id: result.id, message: "Routine Created successfully" })
    } catch (error) {
        if (isFastifyError(error)) throw error

        console.trace(error)
        throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}
