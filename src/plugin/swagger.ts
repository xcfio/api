import Swagger from "@fastify/swagger"
import { bugs, license, version } from "../../package.json"
import { main } from "../"

export default async function swagger(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(Swagger, {
        hideUntagged: true,
        openapi: {
            openapi: "3.1.1",
            info: {
                title: "Chat App API",
                description:
                    "RESTful API for real-time chat application with user authentication and message management",
                version: version,
                license: {
                    name: license,
                    url: "https://opensource.org/licenses/MIT"
                },
                contact: {
                    email: bugs.email,
                    name: "Support Team",
                    url: "https://discord.com/invite/FaCCaFM74Q"
                },
                termsOfService: "/terms"
            },
            tags: [
                {
                    name: "Authentication",
                    description: "OAuth authentication and session management endpoints"
                },
                {
                    name: "Conversations",
                    description: "Direct conversation management endpoints"
                },
                {
                    name: "Messages",
                    description: "Message operations and status management endpoints"
                },
                {
                    name: "Users",
                    description: "User profile management and discovery endpoints"
                },
                {
                    name: "Search",
                    description: "Search functionality for users and messages"
                },
                {
                    name: "Sessions",
                    description: "User session management endpoints"
                }
            ]
        }
    })
}
