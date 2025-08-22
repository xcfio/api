import { Type } from "@sinclair/typebox"
import { ErrorResponse } from "../type"

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
        category: Type.Union([Type.Literal("general"), Type.Literal("feature"), Type.Literal("bug")], {
            description: "Message category"
        }),
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
