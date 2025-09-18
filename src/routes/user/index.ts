import { main } from "../../"
import GetUserWithID from "./id-user"
import GetUserWithoutID from "./user"

export default function User(fastify: Awaited<ReturnType<typeof main>>) {
    GetUserWithoutID(fastify)
    GetUserWithID(fastify)
}
