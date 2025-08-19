import { FastifyRequest, FastifyReply } from "fastify"
import { CreateError } from "../../function"

export async function auth(request: FastifyRequest, reply: FastifyReply) {
    throw CreateError(501, "NOT_IMPLEMENTED", "Implemented")
}
