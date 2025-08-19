import { PostSchema, PutSchema } from "./type"
import { post } from "./post"
import { put } from "./put"
import fn from "../"

export default function Routine(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({ method: "POST", url: "/routine", schema: PostSchema, handler: post })
    fastify.route({ method: "PUT", url: "/routine", schema: PutSchema, handler: put })
}
