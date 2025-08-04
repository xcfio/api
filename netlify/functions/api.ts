import serverless from "serverless-http"
import fastify from "../../src/index"

export const handler = async (event: any, context: any) => {
    const handler = serverless((await fastify()) as any)
    const result = await handler(event, context)
    return result
}
