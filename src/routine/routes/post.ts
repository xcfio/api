import { CreateError, isFastifyError } from "../../function"
import { FastifyRequest, FastifyReply } from "fastify"
import { Static } from "@sinclair/typebox"
import { db, table } from "../database"
import { and, eq } from "drizzle-orm"
import { PostBody } from "../type"

export async function post(request: FastifyRequest<{ Body: Static<typeof PostBody> }>, reply: FastifyReply) {
    try {
        const { year, department, semester, shift, group } = request.body

        const [data] = await db
            .select()
            .from(table.routine)
            .where(
                and(eq(table.routine.year, year), eq(table.routine.code, `${department}-${semester}${group}${shift}`))
            )

        if (!data) throw CreateError(404, "ROUTINE_NOT_FOUND", "Routine not found")

        return reply.code(200).send(data)
    } catch (error) {
        if (isFastifyError(error)) throw error

        console.trace(error)
        throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}
