import SwaggerUI from "@fastify/swagger-ui"
import { FastifySwaggerUiOptions } from "@fastify/swagger-ui"
import { SCSS } from "../function/css"
import { main } from "../"

export default async function swagger_ui(fastify: Awaited<ReturnType<typeof main>>) {
    let logo: FastifySwaggerUiOptions["logo"]

    try {
        logo = {
            type: "image/svg+xml",
            href: "https://github.com/xcfio/chat-app",
            target: "_blank",
            content: await (
                await fetch(
                    "https://raw.githubusercontent.com/xcfio/chat-app/refs/heads/main/apps/frontend/public/favicon.svg"
                )
            ).text()
        }
    } catch (error) {
        if (Error.isError(error) && error.message === "fetch failed") {
            console.log("Failed to fetch logo")
        } else {
            console.trace(error)
        }
    }

    await fastify.register(SwaggerUI, {
        routePrefix: "/",
        staticCSP: true,
        transformSpecificationClone: true,
        uiConfig: {
            defaultModelRendering: "example",
            docExpansion: "list",
            displayRequestDuration: true,
            showCommonExtensions: false,
            displayOperationId: false,
            tryItOutEnabled: false,
            showExtensions: false,
            deepLinking: false,
            filter: true,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            supportedSubmitMethods: []
        },
        logo,
        theme: {
            title: "Chat App API Documentation",
            css: [
                {
                    filename: "custom.css",
                    content: SCSS
                }
            ]
        }
    })
}
