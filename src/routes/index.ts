import { main } from "../"
import Conversation from "./conversation"
import Message from "./message"
import OAuth2 from "./oauth"
import Search from "./search"
import Session from "./session"
import User from "./user"

export default function Routes(fastify: Awaited<ReturnType<typeof main>>) {
    Conversation(fastify)
    Message(fastify)
    OAuth2(fastify)
    Search(fastify)
    Session(fastify)
    User(fastify)
}
