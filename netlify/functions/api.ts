// YOUR_BASE_DIRECTORY/netlify/functions/api.ts

import express, { Router } from "express"
import cors from "cors"
import serverless from "serverless-http"

const app = express().use(cors())

const router = Router()
app.get("/", (req, res) => res.status(200).send("Success"))
router.get("/hello", (req, res) => res.send("Hello World!"))

app.use("/api", router)

export const handler = serverless(app)
