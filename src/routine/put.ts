import { FastifyRequest, FastifyReply } from "fastify"
import { db, table } from "./database"
import { RoutineData } from "./type"

export async function put(
    request: FastifyRequest<{ Querystring: { key: string; year: string }; Body: RoutineData }>,
    reply: FastifyReply
) {
    try {
        const { key, year } = request.query
        if (!key) return reply.code(400).send({ error: "Key is required" })
        if (key !== process.env.SECRET) return reply.code(403).send({ error: "Forbidden" })

        const routine = request.body
        if (!routine || typeof routine !== "object") return reply.code(400).send({ error: "Invalid body" })
        if (!routine.code || !routine.load || !routine.class || !routine.teacher) {
            return reply.code(400).send({ error: "Missing required fields" })
        }

        const [result] = await db
            .insert(table.routine)
            .values({ ...routine, year })
            .returning()
        return reply.code(201).send({ id: result.id, message: "Routine Created successfully" })
    } catch (error) {
        console.log(error)
        return reply.code(500).send({ error: "Internal Server Error" })
    }
}
