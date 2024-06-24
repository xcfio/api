import router from "../../src/index"
import serverless from "serverless-http"
import express from "express"
import cors from "cors"

export const app = express().use(cors()).use(express.json()).use(router())
export const handler = serverless(app)
