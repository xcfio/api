import { SearchMessages } from "./message"
import { SearchUsers } from "./user"
import { main } from "../../"

export default function Search(fastify: Awaited<ReturnType<typeof main>>) {
    SearchMessages(fastify)
    SearchUsers(fastify)
}
