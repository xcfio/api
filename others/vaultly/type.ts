import { Type } from "@sinclair/typebox"
import { ErrorResponse } from "../type"
export { ErrorResponse } from "../type"

export const PostBody = Type.Object({
    id: Type.String(),
    key: Type.String()
})

export const PostResponse = Type.Object({
    id: Type.String(),
    message: Type.String()
})

export const PutBody = Type.Object({
    key: Type.String(),
    message: Type.String(),
    expires: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    one_time: Type.Optional(Type.Boolean())
})

export const PutResponse = Type.Object({
    id: Type.String(),
    message: Type.String(),
    expires: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    one_time: Type.Optional(Type.Boolean())
})

export const PostSchema = {
    body: PostBody,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: PostResponse
    }
}

export const PutSchema = {
    body: PutBody,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: PutResponse
    }
}
