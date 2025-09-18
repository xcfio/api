import { main } from "../../"
import SessionLogout from "./logout"
import SessionMe from "./me"
import SessionRefresh from "./refresh"

export default function Session(fastify: Awaited<ReturnType<typeof main>>) {
    SessionRefresh(fastify)
    SessionLogout(fastify)
    SessionMe(fastify)
}
