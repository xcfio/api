import { Type, Static } from "@sinclair/typebox"
import { Server } from "socket.io"
import { v7 } from "uuid"

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => void
        user: Static<typeof JWTPayload>
        io: Server
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            CA_DATABASE_URI: string
            COOKIE_SECRET: string
            JWT_SECRET: string

            GITHUB_CLIENT_ID: string
            GITHUB_CLIENT_SECRET: string

            GOOGLE_CLIENT_ID: string
            GOOGLE_CLIENT_SECRET: string
        }
    }
}

export function ErrorResponse(code: number, description?: string) {
    return Type.Object(
        {
            statusCode: Type.Number({
                examples: [code],
                description: "HTTP status code of the error"
            }),
            error: Type.String({
                description: "Error type or category"
            }),
            message: Type.String({
                description: "Human-readable error message"
            })
        },
        {
            $id: "ErrorResponse",
            description: description ?? "Standard error response format for API endpoints"
        }
    )
}

export type UserStatus = Static<typeof UserStatus>
export type OAuthProvider = Static<typeof OAuthProvider>
export type MessageStatus = Static<typeof MessageStatus>
export const UserStatus = Type.Union([Type.Literal("online"), Type.Literal("offline")])
export const OAuthProvider = Type.Union([Type.Literal("github"), Type.Literal("google")])
export const MessageStatus = Type.Union(
    [
        Type.Literal("sent", {
            description: "Message has been sent but not yet delivered to recipient"
        }),
        Type.Literal("delivered", {
            description: "Message has been successfully delivered to the recipient's device"
        }),
        Type.Literal("read", {
            description: "Message has been opened and read by the recipient"
        }),
        Type.Literal("deleted", {
            description: "Message has been deleted by sender or recipient"
        })
    ],
    {
        description: "Message delivery and read status tracking the lifecycle of a message from sending to final state"
    }
)

export type JWTPayload = Static<typeof JWTPayload>
export const JWTPayload = Type.Object({
    id: Type.String({ pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" }),
    email: Type.String({ pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" }),
    username: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    avatar: Type.Union([Type.String({ pattern: "^https?://.+" }), Type.Null()]),
    type: OAuthProvider,
    token: Type.String(),
    iat: Type.Number(),
    exp: Type.Number()
})

export type User = Static<typeof User>
export const User = Type.Object(
    {
        id: Type.String({
            examples: [v7()],
            pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            description: "Unique identifier for the user"
        }),
        email: Type.String({
            examples: ["me@example.com"],
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            description: "User's email address"
        }),
        username: Type.String({
            description: "Unique username for the user account"
        }),
        name: Type.Union(
            [
                Type.String({
                    description: "User's display name if it exists"
                }),
                Type.Null({
                    description: "Null if no display name is set"
                })
            ],
            {
                description: "User's display name (optional)"
            }
        ),
        avatar: Type.Union(
            [
                Type.String({
                    examples: ["https://avatars.githubusercontent.com/u/119097812"],
                    pattern: "^https?://.+",
                    description: "URL to the user's avatar image if it exists"
                }),
                Type.Null({
                    description: "Null if no avatar is set"
                })
            ],
            {
                description: "User's avatar image (optional)"
            }
        ),
        createdAt: Type.String({
            format: "date-time",
            description: "ISO timestamp of when user account was created"
        })
    },
    {
        description: "User profile information"
    }
)

export type Message = Static<typeof Message>
export const Message = Type.Object(
    {
        id: Type.String({
            examples: [v7()],
            pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            description: "Unique identifier for the message using UUID v7 format"
        }),
        content: Type.String({
            maxLength: 2000,
            description: "The text content of the message, limited to 2000 characters"
        }),
        sender: Type.String({
            examples: [v7()],
            pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            description: "UUID of the user who sent the message"
        }),
        conversation: Type.String({
            examples: [v7()],
            pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            description: "UUID of the conversation"
        }),
        status: MessageStatus,
        createdAt: Type.String({
            format: "date-time",
            description: "ISO timestamp when the message was first created"
        }),
        editedAt: Type.Union([
            Type.String({
                format: "date-time",
                description: "ISO timestamp of when the message was last edited"
            }),
            Type.Null({
                description: "Indicates the message has never been edited"
            })
        ])
    },
    {
        description: "Schema for a message entity representing communication between users"
    }
)

export type Conversation = Static<typeof Conversation>
export const Conversation = Type.Object({
    id: Type.String({
        examples: [v7()],
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "Unique identifier for the conversation"
    }),
    p1: Type.String({
        examples: [v7()],
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "User ID of the first participant in the conversation"
    }),
    p2: Type.String({
        examples: [v7()],
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description: "User ID of the second participant in the conversation"
    }),
    createdAt: Type.String({
        format: "date-time",
        description: "ISO timestamp when the conversation was created"
    }),
    updatedAt: Type.String({
        format: "date-time",
        description: "ISO timestamp when the conversation was last updated (last message sent)"
    })
})

export type ServerToClientEvents = {
    new_message: (message: Message) => void
    message_deleted: (data: { messageId: string; conversationId: string }) => void
    message_edited: (data: { messageId: string; content: string; editedAt: string; conversationId: string }) => void
    user_status_changed: (userId: string, status: UserStatus) => void
    user_typing: (userId: string, isTyping: boolean) => void
    error: (error: { message: string; code: string }) => void
}

export type ClientToServerEvents = {
    update_status: (status: UserStatus) => void
    typing: (chatId: string, isTyping: boolean) => void
}
