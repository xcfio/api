import { createCipheriv, createHmac, randomBytes, scryptSync } from "node:crypto"
import { FastifyRequest, FastifyReply } from "fastify"
import { db, table } from "./database"

export async function put(
    request: FastifyRequest<{
        Body: {
            key: string
            message: string
            expires?: string | null
            one_time?: boolean | null
        }
    }>,
    reply: FastifyReply
) {
    try {
        const { key, message, expires = null, one_time = false } = request.body
        const hmac = createHmac("sha512", process.env.SECRET).update(key).digest("hex")
        const encrypted = encrypt(hmac, message)

        const [data] = await db
            .insert(table.message)
            .values({
                key: hmac,
                message: encrypted,
                expires: expires ? new Date(expires) : null,
                one_time: Boolean(one_time)
            })
            .returning()

        return { id: data.id, message, expires, one_time }
    } catch (error) {
        console.log(error)
        return reply.code(500).send({ error: "Internal Server Error" })
    }
}

export function encrypt(hmac: string, text: string) {
    const iv = randomBytes(16)
    const derivedKey = scryptSync(process.env.SECRET, hmac, 32)

    const cipher = createCipheriv("aes-256-cbc", derivedKey, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    return `${encrypted}:${iv.toString("hex")}`
}
