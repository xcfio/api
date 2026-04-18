import Routine from "./routine"
import Vaultly from "./vaultly"
import xcfbot from "./xcfbot"
import Support from "./support"
import { main } from "../src/index"

export default function Others(fastify: Awaited<ReturnType<typeof main>>) {
    Routine(fastify)
    Support(fastify)
    Vaultly(fastify)
    xcfbot(fastify)
}
