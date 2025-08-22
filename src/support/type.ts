import { Type } from "@sinclair/typebox"
import { ErrorResponse } from "../type"

export const categories = {
    feature: "Feature Request",
    general: "General",
    bug: "Bug Report"
}

export const Schema = {
    body: Type.Object({
        name: Type.String({
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z\\s]+$",
            description: "Full name (letters and spaces only)"
        }),
        email: Type.String({
            format: "email",
            maxLength: 255,
            description: "Valid email address"
        }),
        category: Type.Union(
            Object.keys(categories).map((x) => Type.Literal(x)),
            { description: "Message category" }
        ),
        subject: Type.String({
            minLength: 5,
            maxLength: 200,
            description: "Message subject"
        }),
        message: Type.String({
            minLength: 10,
            maxLength: 3800,
            description: "Message content"
        })
    }),
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: Type.Object({
            success: Type.Boolean(),
            message: Type.String()
        })
    }
}
