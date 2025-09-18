import AuthGithub from "./github"
import AuthGoogle from "./google"
import { main } from "../../"

export default function OAuth2(fastify: Awaited<ReturnType<typeof main>>) {
    AuthGithub(fastify)
    AuthGoogle(fastify)
}
