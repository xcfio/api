import { ComponentType, MessageFlags, RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10"
import { CreateError, isFastifyError } from "../function"
import { FastifyReply, FastifyRequest } from "fastify"
import { Static } from "@sinclair/typebox"
import { categories, Schema } from "./type"
import fn from "../"

export default function Support(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({
        method: "POST",
        url: "/support",
        schema: Schema,
        handler: async function (request: FastifyRequest<{ Body: Static<typeof Schema.body> }>, reply: FastifyReply) {
            try {
                const { name, email, category, subject, message } = request.body
                const host = request.headers.host || "Unknown Host"

                const payload: RESTPostAPIWebhookWithTokenJSONBody = {
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: ComponentType.Container,
                            components: [
                                {
                                    type: ComponentType.TextDisplay,
                                    content: `## ${(categories as any)[category] ?? "Support"} - ${subject}`
                                },
                                {
                                    type: ComponentType.Separator
                                },
                                {
                                    type: ComponentType.TextDisplay,
                                    content: `**Name:** ${name}\n**Email:** ${email}\n**Subject:** ${subject}\n**Host:** ${host}\n\n**Message:**\n${message}`
                                }
                            ]
                        }
                    ]
                }

                const response = await fetch(`${process.env.WEBHOOK}?with_components=true`, {
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    method: "POST"
                })

                if (!response.ok) {
                    console.error("Discord webhook failed:", response.status, await response.text())
                    throw CreateError(500, "WEBHOOK_FAILED", `Failed to send to Discord: ${response.status}`)
                }

                return reply.status(200).send({
                    success: true,
                    message: "Support request submitted successfully"
                })
            } catch (error) {
                if (isFastifyError(error)) {
                    throw error
                } else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
