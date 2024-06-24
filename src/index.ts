import { NextFunction, Request, Response, Router } from "express"
const router = Router()

export default () => {
    router.use((req, res) => res.sendStatus(200))

    router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
        if (!res.headersSent) res.sendStatus(500)
        console.trace(error)
    })
    return router
}
