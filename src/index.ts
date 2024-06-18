import { NextFunction, Request, Response, Router } from "express"
const router = Router()

export default () => {
    router.use((_req, res, next) => {
        res.status(400).send(process.env.context)
    })

    router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.trace(error)
        if (!res.headersSent) res.sendStatus(500)
    })
    return router
}
