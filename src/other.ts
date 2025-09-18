import Routine from "../others/routine"
import Vaultly from "../others/vaultly"
import xcfbot from "../others/xcfbot"
import Support from "../others/support"
import { main } from "./index"

export default function Others(fastify: Awaited<ReturnType<typeof main>>) {
    Routine(fastify)
    Support(fastify)
    Vaultly(fastify)
    xcfbot(fastify)
}
