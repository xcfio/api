import { PostSchema, PutSchema } from "./type"
import { post } from "./post"
import { put } from "./put"
import fn from "../"

export default function Vaultly(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({ method: "POST", url: "/vaultly", schema: PostSchema, handler: post })
    fastify.route({ method: "PUT", url: "/vaultly", schema: PutSchema, handler: put })
}
