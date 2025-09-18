import DeleteMessage from "./delete-message"
import EditMessage from "./edit-message"
import GetMessages from "./get-message"
import ReadMessage from "./read-message"
import SendMessage from "./send-message"
import { main } from "../../"

export default function Message(fastify: Awaited<ReturnType<typeof main>>) {
    DeleteMessage(fastify)
    EditMessage(fastify)
    GetMessages(fastify)
    ReadMessage(fastify)
    SendMessage(fastify)
}
