import Fastify from "fastify"

export default async () => {
    const fastify = Fastify({ logger: true })

    fastify.get("/", () => "Success")
    fastify.get("/status", (_, reply) => reply.code(200).send({ status: "ok" }))

    return fastify
}
