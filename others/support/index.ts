import { ComponentType, MessageFlags } from "discord-api-types/v10"
import { categories, SupportSchema, WishlistSchema } from "./type"
import { CreateError, isFastifyError } from "../function"
import { SnowTransfer } from "snowtransfer"
import { main as fn } from "../../src"

const client = new SnowTransfer(process.env.TOKEN)

export default function Support(fastify: Awaited<ReturnType<typeof fn>>) {
    fastify.route({
        method: "POST",
        url: "/support",
        schema: SupportSchema,
        handler: async function (request, reply) {
            try {
                const { name, email, category, subject, message } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"

                await client.channel.createMessage(process.env.CHANNEL, {
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
                                    content: `**Name:** ${name}\n**Email:** ${email}\n**Subject:** ${subject}\n**Origin:** ${host}\n\n**Message:**\n${message}`
                                }
                            ]
                        }
                    ]
                })

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

    fastify.route({
        method: "POST",
        url: "/wishlist",
        schema: WishlistSchema,
        handler: async function (request, reply) {
            try {
                const { fullName, email } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"

                await client.channel.createMessage(process.env.CHANNEL, {
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: ComponentType.Container,
                            components: [
                                {
                                    type: ComponentType.TextDisplay,
                                    content: `Wishlist Signup`
                                },
                                {
                                    type: ComponentType.Separator
                                },
                                {
                                    type: ComponentType.TextDisplay,
                                    content: `**Name:** ${fullName}\n**Email:** ${email}\n**Origin:** ${host}\n**Timestamp:** ${new Date().toLocaleString(
                                        "en-BD",
                                        { timeZone: "Asia/Dhaka" }
                                    )}`
                                }
                            ]
                        }
                    ]
                })

                return reply.status(200).send({
                    success: true,
                    message: "Successfully joined the wishlist"
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
