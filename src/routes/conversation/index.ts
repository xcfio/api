import { CreateConversation } from "./create-conversation"
import { DeleteConversation } from "./delete-conversation"
import { GetConversationId } from "./get-conversation-id"
import { GetConversation } from "./get-conversation"
import { main } from "../../"

export default function Conversation(fastify: Awaited<ReturnType<typeof main>>) {
    CreateConversation(fastify)
    DeleteConversation(fastify)
    GetConversationId(fastify)
    GetConversation(fastify)
}
