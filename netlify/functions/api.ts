import router from "../../src/index"
import serverless from "serverless-http"
import express from "express"
import cors from "cors"

export const handler = serverless(express().use(cors(), router()))
