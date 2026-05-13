Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
//#region \0rolldown/runtime.js
var __create = Object.create
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __getProtoOf = Object.getPrototypeOf
var __hasOwnProp = Object.prototype.hasOwnProperty
var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === "object") || typeof from === "function")
        for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
            key = keys[i]
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, {
                    get: ((k) => from[k]).bind(null, key),
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                })
        }
    return to
}
var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
        isNodeMode || !mod || !mod.__esModule
            ? __defProp(target, "default", {
                  value: mod,
                  enumerable: true
              })
            : target,
        mod
    )
)
//#endregion
let fastify_utils = require("fastify-utils")
let discord_api_types_v10 = require("discord-api-types/v10")
let snowtransfer = require("snowtransfer")
let _fastify_error = require("@fastify/error")
_fastify_error = __toESM(_fastify_error)
let node_util = require("node:util")
let node_crypto = require("node:crypto")
let drizzle_orm_typebox = require("drizzle-orm/typebox")
let drizzle_orm_pg_core = require("drizzle-orm/pg-core")
let uuid = require("uuid")
let drizzle_orm = require("drizzle-orm")
let typebox = require("typebox")
typebox = __toESM(typebox)
let typebox_value = require("typebox/value")
typebox_value = __toESM(typebox_value)
let drizzle_orm_postgres_js = require("drizzle-orm/postgres-js")
let postgres = require("postgres")
postgres = __toESM(postgres)
let fastify_socket = require("fastify-socket")
fastify_socket = __toESM(fastify_socket)
let _fastify_swagger = require("@fastify/swagger")
_fastify_swagger = __toESM(_fastify_swagger)
let _fastify_cookie = require("@fastify/cookie")
_fastify_cookie = __toESM(_fastify_cookie)
let _fastify_rate_limit = require("@fastify/rate-limit")
_fastify_rate_limit = __toESM(_fastify_rate_limit)
let _scalar_fastify_api_reference = require("@scalar/fastify-api-reference")
_scalar_fastify_api_reference = __toESM(_scalar_fastify_api_reference)
let _fastify_cors = require("@fastify/cors")
_fastify_cors = __toESM(_fastify_cors)
let _fastify_jwt = require("@fastify/jwt")
_fastify_jwt = __toESM(_fastify_jwt)
let fastify = require("fastify")
fastify = __toESM(fastify)
//#region src/function/discord.ts
const client$1 = new snowtransfer.SnowTransfer(process.env.TOKEN, {
    allowed_mentions: {
        replied_user: true,
        parse: [
            discord_api_types_v10.AllowedMentionsTypes.Everyone,
            discord_api_types_v10.AllowedMentionsTypes.Role,
            discord_api_types_v10.AllowedMentionsTypes.User
        ]
    }
})
//#endregion
//#region src/type.ts
var FrontendError = class extends Error {
    constructor({ name, message, stack, cause }) {
        super()
        this.name = name
        this.message = message
        this.stack = stack
        this.cause = cause
    }
    toJSON() {
        const stack = this.stack?.split("\n") ?? []
        if (stack.length > 20) stack.length = 20
        return {
            name: this.name,
            messages: this.message,
            stack,
            cause: this.cause
        }
    }
}
//#endregion
//#region src/function/error.ts
/**
 * Type guard to check if a given error is a FastifyError.
 *
 * This function ensures type narrowing in TypeScript by returning
 * a type predicate. It is useful when handling errors in Fastify
 * applications to distinguish Fastify-specific errors from generic ones.
 *
 * @param {any} error - The error object to check
 * @returns {error is FastifyError} True if the error is an instance of FastifyError, otherwise false
 *
 * @example
 * ```typescript
 * try {
 *   // Some Fastify operation
 * } catch (error) {
 *   if (isFastifyError(error)) throw error
 *   console.trace(error);
 * }
 * ```
 */
function isFastifyError$1(error) {
    return error instanceof _fastify_error.FastifyError
}
/**
 * Creates a custom Fastify error using @fastify/error factory
 *
 * This function creates properly formatted Fastify errors that work seamlessly
 * with Fastify's error handling and serialization system.
 *
 * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
 * @param {string} code - Unique error code identifier (e.g., 'USER_NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @param {Record<string, any>} [details] - Optional additional error details
 *
 * @returns {Error} Fastify-compatible error instance
 *
 * @example
 * ```typescript
 * // Create and throw an error
 * throw CreateError(404, 'USER_NOT_FOUND', 'User not found', { userId: '123' });
 *
 * // Create error for conditional throwing
 * const error = CreateError(400, 'VALIDATION_ERROR', 'Invalid input');
 * if (shouldThrow) throw error;
 * ```
 */
function CreateError$1(statusCode, code, message, details) {
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600)
        throw new TypeError("statusCode must be a valid HTTP status code (100-599)")
    if (!code || typeof code !== "string" || code.trim().length === 0)
        throw new TypeError("code must be a non-empty string")
    if (!message || typeof message !== "string" || message.trim().length === 0)
        throw new TypeError("message must be a non-empty string")
    const error = new ((0, _fastify_error.default)(code.trim().toUpperCase(), message, statusCode))()
    if (details && Object.keys(details).length > 0) Object.assign(error, { details: { ...details } })
    return error
}
async function xcf(givenError, type = "Uncaught Exception", origin, shouldThrow = true) {
    const error = givenError
    if (isFastifyError$1(error)) throw error
    if (error instanceof snowtransfer.DiscordAPIError) return await handleDiscordAPIError(error, shouldThrow)
    if (error instanceof FrontendError) return await handleFrontendError(error, shouldThrow)
    console.trace(error, origin)
    await reply(type, "```js\n" + error.stack + "\n```")
    if (shouldThrow) throw CreateError$1(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function handleDiscordAPIError(error, shouldThrow) {
    console.log(
        (0, node_util.inspect)(error, {
            depth: 10,
            colors: true
        })
    )
    console.log(error.stack)
    let text
    for (let depth = 10; !text || text.length > 4096; depth--)
        if (depth > 0) {
            text =
                `\`\`\`js\n${(0, node_util.inspect)(error, false, 10)}\n${(0, node_util.inspect)(error, false, depth)}`.concat(
                    `\n\`\`\``
                )
            text = text + "```js\n" + (error.stack ?? "null") + "\n```"
        } else text = "Error is too large to send"
    await reply(`Discord API Error (${error.code})`, text)
    if (shouldThrow) throw CreateError$1(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function handleFrontendError(error, shouldThrow) {
    await reply(
        "Client Error - Received error from client socket",
        "```json\n" + JSON.stringify(error, null, 4) + "\n```"
    )
    if (shouldThrow) throw CreateError$1(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function reply(type, text) {
    if (!client$1 || !process.env.ERROR_LOG_CHANNEL) return
    await client$1.channel.createMessage(process.env.ERROR_LOG_CHANNEL, {
        flags: discord_api_types_v10.MessageFlags.IsComponentsV2,
        components: [
            {
                type: discord_api_types_v10.ComponentType.Container,
                components: [
                    {
                        type: discord_api_types_v10.ComponentType.TextDisplay,
                        content: `### ${type}`
                    },
                    {
                        type: discord_api_types_v10.ComponentType.Separator,
                        spacing: discord_api_types_v10.SeparatorSpacingSize.Small
                    },
                    {
                        type: discord_api_types_v10.ComponentType.TextDisplay,
                        content: text
                    },
                    {
                        type: discord_api_types_v10.ComponentType.TextDisplay,
                        content: `-# Time: ${/* @__PURE__ */ new Date().toUTCString()}\n-# Origin: [chatio](https://chatio-xcfio.vercel.app)`
                    }
                ]
            }
        ]
    })
}
//#endregion
//#region src/function/password.ts
function HmacPassword(password) {
    return (0, node_crypto.createHmac)("sha512", process.env.HMAC_SECRET).update(password).digest("hex")
}
//#endregion
//#region src/function/utils.ts
/**
 * Converts a database object to TypeBox-compatible format
 * Handles Date objects, null values, and arrays
 */
function toTypeBox(arg) {
    if (!arg || typeof arg !== "object") return arg
    const result = {}
    for (const [key, value] of Object.entries(arg))
        if (value === null || value === void 0) result[key] = null
        else if (value instanceof Date) result[key] = value.toISOString()
        else if (Array.isArray(value))
            result[key] = value.map((item) => (item instanceof Date ? item.toISOString() : item))
        else if (typeof value === "object" && !(value instanceof Date)) result[key] = toTypeBox(value)
        else result[key] = value
    return result
}
//#endregion
//#region ../../lib/schema/src/table/conversations.ts
const conversations = (0, drizzle_orm_pg_core.pgTable)("conversations", {
    id: (0, drizzle_orm_pg_core.uuid)("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => (0, uuid.v7)()),
    users: (0, drizzle_orm_pg_core.uuid)("users").array().notNull(),
    createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at", { withTimezone: false })
        .notNull()
        .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at", { withTimezone: false })
        .notNull()
        .$onUpdateFn(() => /* @__PURE__ */ new Date())
})
;(0, drizzle_orm_typebox.createInsertSchema)(conversations)
;(0, drizzle_orm_typebox.createSelectSchema)(conversations)
;(0, drizzle_orm_typebox.createUpdateSchema)(conversations)
//#endregion
//#region ../../lib/schema/src/table/users.ts
const Gender = (0, drizzle_orm_pg_core.pgEnum)("gender", ["male", "female", "other"])
const users = (0, drizzle_orm_pg_core.pgTable)(
    "users",
    {
        id: (0, drizzle_orm_pg_core.uuid)("id")
            .primaryKey()
            .$defaultFn(() => (0, uuid.v7)()),
        email: (0, drizzle_orm_pg_core.text)("email").notNull().unique(),
        name: (0, drizzle_orm_pg_core.text)("name").notNull(),
        username: (0, drizzle_orm_pg_core.text)("username").unique().notNull(),
        gender: Gender("gender").notNull(),
        avatar: (0, drizzle_orm_pg_core.text)("avatar"),
        password: (0, drizzle_orm_pg_core.char)("password", { length: 128 }).notNull(),
        ban: (0, drizzle_orm_pg_core.text)("ban"),
        createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at", { withTimezone: false })
            .notNull()
            .$defaultFn(() => /* @__PURE__ */ new Date()),
        updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at", { withTimezone: false })
            .notNull()
            .$onUpdateFn(() => /* @__PURE__ */ new Date())
    },
    (table) => [
        (0, drizzle_orm_pg_core.check)("password_length_check", drizzle_orm.sql`length(${table.password}) = 128`),
        (0, drizzle_orm_pg_core.check)(
            "username_format_check",
            drizzle_orm.sql`${table.username} ~ '^[a-zA-Z][a-zA-Z0-9-]{2,11}$'`
        ),
        (0, drizzle_orm_pg_core.check)("email_format_check", drizzle_orm.sql`${table.email} ~ '^[^@]+@[^@]+\.[^@]+$'`)
    ]
)
;(0, drizzle_orm_typebox.createInsertSchema)(users)
const UserSelect = (0, drizzle_orm_typebox.createSelectSchema)(users)
;(0, drizzle_orm_typebox.createUpdateSchema)(users)
//#endregion
//#region ../../lib/schema/src/table/messages.ts
const status = (0, drizzle_orm_pg_core.pgEnum)("status", ["sent", "delivered", "read", "edited", "deleted"])
const messages = (0, drizzle_orm_pg_core.pgTable)("messages", {
    id: (0, drizzle_orm_pg_core.uuid)("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => (0, uuid.v7)()),
    content: (0, drizzle_orm_pg_core.text)("content").notNull(),
    sender: (0, drizzle_orm_pg_core.uuid)("sender")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    conversation: (0, drizzle_orm_pg_core.uuid)("conversation")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    status: status("status").array().notNull().default(["sent"]),
    createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at", { withTimezone: false })
        .notNull()
        .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at", { withTimezone: false })
        .notNull()
        .$onUpdateFn(() => /* @__PURE__ */ new Date())
})
;(0, drizzle_orm_typebox.createInsertSchema)(messages)
const MessageSelect = (0, drizzle_orm_typebox.createSelectSchema)(messages)
;(0, drizzle_orm_typebox.createUpdateSchema)(messages)
//#endregion
//#region ../../lib/schema/src/types/utility.ts
const Nullable = (schema, options) => {
    return typebox.Type.Union([schema, typebox.Type.Null()], options)
}
const UUID = typebox.Type.String({
    examples: [(0, uuid.v7)()],
    pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
})
const Date$1 = typebox.Type.String({ format: "date-time" })
//#endregion
//#region ../../lib/schema/src/types/conversations.ts
const Conversation$1 = typebox.default.Object({
    id: UUID,
    participant: UUID,
    createdAt: Date$1,
    updatedAt: Date$1
})
//#endregion
//#region ../../lib/schema/src/types/messages.ts
const MessageContent = typebox.default.String({
    minLength: 1,
    maxLength: 2e3
})
const Message$1 = typebox.default.Object({
    id: UUID,
    content: MessageContent,
    sender: UUID,
    conversation: UUID,
    status: MessageSelect.properties.status,
    createdAt: Date$1,
    updatedAt: Date$1
})
//#endregion
//#region ../../lib/schema/src/types/response.ts
const Payload = typebox.Type.Object({
    id: UUID,
    iat: typebox.Type.Number(),
    exp: typebox.Type.Number()
})
function ErrorResponse$1(code, description) {
    return typebox.Type.Object(
        {
            statusCode: typebox.Type.Integer({
                examples: [code],
                description: "HTTP status code of the error"
            }),
            error: typebox.Type.String({ description: "Error type or category" }),
            message: typebox.Type.String({ description: "Human-readable error message" })
        },
        {
            $id: "ErrorResponse",
            description: description ?? "Standard error response format for API endpoints"
        }
    )
}
//#endregion
//#region ../../lib/schema/src/types/user.ts
const RegisterUser = typebox.default.Object({
    email: typebox.default.String({ format: "email" }),
    name: UserSelect.properties.name,
    username: typebox.default.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    gender: UserSelect.properties.gender,
    avatar: typebox.default.Optional(typebox.default.String({ format: "url" })),
    password: typebox.default.String({
        minLength: 6,
        maxLength: 30
    })
})
const LoginUser = typebox.default.Object({
    input: typebox.default.String(),
    password: typebox.default.String()
})
const ChangeUserEmail = typebox.default.Object({
    email: typebox.default.String({ format: "email" }),
    password: typebox.default.String()
})
const ChangeUserPassword = typebox.default.Object({
    oldPassword: typebox.default.String(),
    newPassword: typebox.default.String({
        minLength: 6,
        maxLength: 30
    })
})
const PublicUser = typebox.default.Object({
    id: UUID,
    name: UserSelect.properties.name,
    username: typebox.default.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    avatar: Nullable(typebox.default.String({ format: "url" })),
    gender: UserSelect.properties.gender,
    createdAt: Date$1
})
const AuthenticatedUser = typebox.default.Interface(
    [typebox.default.Omit(UserSelect, ["ban", "password", "createdAt", "updatedAt"])],
    {
        createdAt: Date$1,
        updatedAt: Date$1
    }
)
const ChangeUserInfo = typebox.default.Partial(
    typebox.default.Pick(AuthenticatedUser, ["name", "username", "gender", "avatar"])
)
//#endregion
//#region src/decorate/auth.ts
async function auth$1(fastify) {
    fastify.decorate("auth", async function (request, reply) {
        try {
            const jwt = request.cookies.auth
            if (!jwt) reply.log.info("No authentication token provided in cookies")
            else reply.log.info(`Authentication token found: ${jwt}`)
            const user = await request.jwtVerify()
            if (!typebox_value.default.Check(Payload, user)) {
                reply.clearCookie("auth", {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/"
                })
                reply.log.info(`Invalid token payload: ${JSON.stringify(user)}`)
                throw CreateError$1(401, "INVALID_TOKEN_PAYLOAD", "Invalid authentication token structure")
            }
            request.payload = user
        } catch (error) {
            reply.clearCookie("auth", {
                signed: true,
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/"
            })
            if (isFastifyError$1(error) || Error.isError(error)) {
                reply.log.info(`Authentication failed: ${JSON.stringify("message" in error ? error.message : error)}`)
                throw CreateError$1(401, "AUTHENTICATION_FAILED", "Authentication failed")
            } else {
                console.trace(error)
                reply.log.info(`Internal server error: ${JSON.stringify(error)}`)
                throw CreateError$1(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
            }
        }
    })
}
//#endregion
//#region src/decorate/index.ts
async function Decorate(fastify) {
    await auth$1(fastify)
}
//#endregion
//#region src/database/index.ts
const db$2 = (0, drizzle_orm_postgres_js.drizzle)({ client: (0, postgres.default)(process.env.DATABASE_URI) })
const table$2 = {
    conversations,
    messages,
    users
}
//#endregion
//#region src/routes/conversation/create-conversation.ts
function CreateConversation(fastify) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id",
        schema: {
            description: "Create new conversation with another user",
            tags: ["Conversations"],
            params: typebox.Type.Object({ id: UUID }),
            response: {
                201: Conversation$1,
                400: ErrorResponse$1(400, "Bad request - invalid user id or conversation already exists"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - User not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: otherUserId } = request.params
                const user = request.payload
                if (user.id === otherUserId)
                    throw CreateError$1(400, "INVALID_REQUEST", "Cannot create conversation with yourself")
                const [otherUser] = await db$2
                    .select({ id: table$2.users.id })
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, otherUserId))
                if (!otherUser) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                if (
                    (
                        await db$2
                            .select()
                            .from(table$2.conversations)
                            .where((0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id, otherUser.id]))
                    ).length > 0
                )
                    throw CreateError$1(400, "CONVERSATION_EXISTS", "Conversation already exists between these users")
                const [conversation] = await db$2
                    .insert(table$2.conversations)
                    .values({ users: [user.id, otherUser.id] })
                    .returning()
                if (!conversation) throw CreateError$1(500, "CREATION_FAILED", "Failed to create conversation")
                const participant = conversation.users.filter((id) => id !== user.id).shift() ?? ""
                return reply.status(201).send(
                    toTypeBox({
                        participant,
                        ...conversation
                    })
                )
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/conversation/delete-conversation.ts
function DeleteConversation(fastify) {
    fastify.route({
        method: "DELETE",
        url: "/conversations/:id",
        schema: {
            description: "Delete a conversation",
            tags: ["Conversations"],
            params: typebox.Type.Object({ id: UUID }),
            response: {
                200: typebox.Type.Object({ success: typebox.Type.Boolean() }),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                403: ErrorResponse$1(403, "Forbidden - not authorized to delete this conversation"),
                404: ErrorResponse$1(404, "Not found - Conversation not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const user = request.payload
                const [existingConversation] = await db$2
                    .select()
                    .from(table$2.conversations)
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.conversations.id, id),
                            (0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id])
                        )
                    )
                if (!existingConversation) throw CreateError$1(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                const [deletedRows] = await db$2
                    .delete(table$2.conversations)
                    .where((0, drizzle_orm.eq)(table$2.conversations.id, id))
                    .returning()
                if (!deletedRows) throw CreateError$1(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                return reply.status(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/conversation/get-conversation-by-id.ts
function GetConversationId(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id",
        schema: {
            description: "Get specific conversation details",
            tags: ["Conversations"],
            params: typebox.Type.Object({ id: UUID }),
            querystring: typebox.Type.Partial(typebox.Type.Object({ type: typebox.Type.String() })),
            response: {
                200: Conversation$1,
                400: ErrorResponse$1(400, "Bad request - Invalid conversation type"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                403: ErrorResponse$1(403, "Forbidden - not a participant in this conversation"),
                404: ErrorResponse$1(404, "Not found - Conversation not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { type } = request.query
                const { id } = request.params
                const user = request.payload
                const conditions = []
                switch (type) {
                    case "conversation":
                        conditions.push(
                            (0, drizzle_orm.eq)(table$2.conversations.id, id),
                            (0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id])
                        )
                        break
                    case "user":
                        conditions.push((0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id, id]))
                        break
                    default:
                        throw CreateError$1(400, "INVALID_CONVERSATION_TYPE", "Invalid conversation type")
                }
                const [conversation] = await db$2
                    .select()
                    .from(table$2.conversations)
                    .where((0, drizzle_orm.and)(...conditions))
                if (!conversation) throw CreateError$1(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                const participant = conversation.users.filter((id) => id !== user.id).shift() ?? ""
                return reply.status(200).send(
                    toTypeBox({
                        participant,
                        ...conversation
                    })
                )
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/conversation/get-conversations.ts
function GetConversation(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations",
        schema: {
            description: "Get user's conversations list",
            tags: ["Conversations"],
            querystring: typebox.Type.Object({
                page: typebox.Type.Optional(
                    typebox.Type.Number({
                        minimum: 1,
                        default: 1
                    })
                ),
                limit: typebox.Type.Optional(
                    typebox.Type.Number({
                        minimum: 1,
                        maximum: 100,
                        default: 20
                    })
                )
            }),
            response: {
                200: typebox.Type.Array(Conversation$1, {
                    maxItems: 100,
                    minItems: 0
                }),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20 } = request.query
                const user = request.payload
                if (!user) throw CreateError$1(401, "UNAUTHORIZED", "User authentication required")
                const offset = (page - 1) * limit
                const conversations = await db$2
                    .select()
                    .from(table$2.conversations)
                    .where((0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id]))
                    .orderBy((0, drizzle_orm.desc)(table$2.conversations.updatedAt))
                    .limit(limit)
                    .offset(offset)
                return reply.status(200).send(
                    conversations.map((x) => {
                        return toTypeBox({
                            participant: x.users.filter((id) => id !== user.id).shift() ?? "",
                            ...x
                        })
                    })
                )
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/conversation/index.ts
function Conversation(fastify) {
    CreateConversation(fastify)
    DeleteConversation(fastify)
    GetConversationId(fastify)
    GetConversation(fastify)
}
//#endregion
//#region src/routes/message/delete-message.ts
function DeleteMessage(fastify) {
    fastify.route({
        method: "DELETE",
        url: "/messages/:id",
        schema: {
            description: "Delete a message",
            tags: ["Messages"],
            params: typebox.Type.Object({ id: UUID }),
            response: {
                200: typebox.Type.Object({ success: typebox.Type.Boolean() }),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - Message not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: msgId } = request.params
                const { id: userId } = request.payload
                const [{ messages, conversations }] = await db$2
                    .select()
                    .from(table$2.messages)
                    .leftJoin(
                        table$2.conversations,
                        (0, drizzle_orm.eq)(table$2.conversations.id, table$2.messages.conversation)
                    )
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.messages.id, msgId),
                            (0, drizzle_orm.eq)(table$2.messages.sender, userId)
                        )
                    )
                if (!messages || !conversations || messages.sender !== userId || messages.status.includes("deleted"))
                    throw CreateError$1(404, "MESSAGE_NOT_FOUND", "Message not found")
                await db$2
                    .update(table$2.messages)
                    .set({ status: [...messages.status, "deleted"] })
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.messages.id, msgId),
                            (0, drizzle_orm.eq)(table$2.messages.sender, userId)
                        )
                    )
                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_deleted", msgId, conversations.id)
                }
                return reply.code(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/message/edit-message.ts
function EditMessage(fastify) {
    fastify.route({
        method: "PATCH",
        url: "/messages/:id",
        schema: {
            description: "Edit a message",
            tags: ["Messages"],
            params: typebox.Type.Object({ id: UUID }),
            body: typebox.Type.Object({ content: MessageContent }),
            response: {
                200: Message$1,
                400: ErrorResponse$1(400, "Bad request - invalid content"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - Message not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const { content } = request.body
                const user = request.payload
                const [{ messages, conversations }] = await db$2
                    .select()
                    .from(table$2.messages)
                    .leftJoin(
                        table$2.conversations,
                        (0, drizzle_orm.eq)(table$2.conversations.id, table$2.messages.conversation)
                    )
                    .where((0, drizzle_orm.eq)(table$2.messages.id, id))
                if (!messages || !conversations || messages.sender !== user.id || messages.status.includes("deleted"))
                    throw CreateError$1(404, "MESSAGE_NOT_FOUND", "Message not found")
                if (messages.content === content.trim())
                    throw CreateError$1(400, "NO_CONTENT_CHANGE", "New content is the same as the current content")
                const [updatedMessage] = await db$2
                    .update(table$2.messages)
                    .set({ content: content.trim() })
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.messages.id, id),
                            (0, drizzle_orm.eq)(table$2.messages.sender, user.id)
                        )
                    )
                    .returning()
                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== user.id)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), conversations.id)
                }
                return reply.code(200).send(toTypeBox(updatedMessage))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/message/get-message.ts
function GetMessages(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id/messages",
        schema: {
            description: "Get messages in a conversation",
            tags: ["Messages"],
            params: typebox.Type.Object({ id: UUID }),
            querystring: typebox.Type.Object({
                page: typebox.Type.Optional(
                    typebox.Type.Number({
                        minimum: 1,
                        default: 1
                    })
                ),
                limit: typebox.Type.Optional(
                    typebox.Type.Number({
                        minimum: 1,
                        maximum: 100,
                        default: 50
                    })
                ),
                before: typebox.Type.Optional(typebox.Type.String({ format: "date-time" })),
                after: typebox.Type.Optional(typebox.Type.String({ format: "date-time" }))
            }),
            response: {
                200: typebox.Type.Array(Message$1, {
                    maxItems: 100,
                    minItems: 0
                }),
                400: ErrorResponse$1(400, "Bad request - invalid query parameters"),
                404: ErrorResponse$1(404, "Not found - Conversation not found error"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: userId } = request.payload
                const { id: conversationId } = request.params
                const { page = 1, limit = 50, before, after } = request.query
                const [conversation] = await db$2
                    .select()
                    .from(table$2.conversations)
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.conversations.id, conversationId),
                            (0, drizzle_orm.arrayContains)(table$2.conversations.users, [userId])
                        )
                    )
                if (!conversation) throw CreateError$1(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                const whereConditions = [
                    (0, drizzle_orm.eq)(table$2.messages.conversation, conversation.id),
                    (0, drizzle_orm.not)((0, drizzle_orm.arrayContains)(table$2.messages.status, ["deleted"]))
                ]
                if (before) {
                    const beforeDate = new Date(before)
                    if (isNaN(beforeDate.getTime()))
                        throw CreateError$1(400, "INVALID_TIMESTAMP", "Invalid 'before' timestamp format")
                    whereConditions.push((0, drizzle_orm.lt)(table$2.messages.createdAt, beforeDate))
                }
                if (after) {
                    const afterDate = new Date(after)
                    if (isNaN(afterDate.getTime()))
                        throw CreateError$1(400, "INVALID_TIMESTAMP", "Invalid 'after' timestamp format")
                    whereConditions.push((0, drizzle_orm.gt)(table$2.messages.createdAt, afterDate))
                }
                const offset = (page - 1) * limit
                const messages = await db$2
                    .select()
                    .from(table$2.messages)
                    .where((0, drizzle_orm.and)(...whereConditions))
                    .orderBy((0, drizzle_orm.asc)(table$2.messages.id))
                    .limit(limit)
                    .offset(offset)
                return reply.code(200).send(messages.map((x) => toTypeBox(x)))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/message/read-message.ts
function ReadMessage(fastify) {
    fastify.route({
        method: "PUT",
        url: "/messages/:id/read",
        schema: {
            description: "Mark a message as read",
            tags: ["Messages"],
            params: typebox.Type.Object({ id: UUID }),
            response: {
                200: typebox.Type.Object({ success: typebox.Type.Boolean() }),
                400: ErrorResponse$1(400, "Bad request - message cannot be marked as read"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - Message not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const { id: userId } = request.payload
                const [{ messages, conversations }] = await db$2
                    .select()
                    .from(table$2.messages)
                    .leftJoin(
                        table$2.conversations,
                        (0, drizzle_orm.eq)(table$2.conversations.id, table$2.messages.conversation)
                    )
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.messages.id, id),
                            (0, drizzle_orm.arrayContains)(table$2.conversations.users, [userId])
                        )
                    )
                if (!messages || !conversations || messages.status.includes("deleted"))
                    throw CreateError$1(404, "MESSAGE_NOT_FOUND", "Message not found")
                if (messages.status.includes("read"))
                    throw CreateError$1(400, "MESSAGE_ALREADY_READ", "Message is already marked as read")
                if (messages.sender === userId)
                    throw CreateError$1(400, "CANNOT_MARK_OWN_MESSAGE", "Cannot mark your own message as read")
                const [updatedMessage] = await db$2
                    .update(table$2.messages)
                    .set({
                        status: [...messages.status, "read"],
                        updatedAt: messages.updatedAt
                    })
                    .where((0, drizzle_orm.eq)(table$2.messages.id, id))
                    .returning()
                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), updatedMessage.conversation)
                }
                return reply.code(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/message/send-message.ts
function SendMessage(fastify) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id/messages",
        schema: {
            description: "Send a new message to a conversation",
            tags: ["Messages"],
            params: typebox.Type.Object({ id: UUID }),
            body: typebox.Type.Object({ content: MessageContent }),
            response: {
                201: Message$1,
                400: ErrorResponse$1(400, "Bad request - invalid message content"),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - conversation not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: conversationId } = request.params
                const { id: userId } = request.payload
                const { content } = request.body
                const trimmedContent = content.trim()
                if (!trimmedContent) throw CreateError$1(400, "INVALID_CONTENT", "Message content cannot be empty")
                const [conversations] = await db$2
                    .select()
                    .from(table$2.conversations)
                    .where(
                        (0, drizzle_orm.and)(
                            (0, drizzle_orm.eq)(table$2.conversations.id, conversationId),
                            (0, drizzle_orm.arrayContains)(table$2.conversations.users, [userId])
                        )
                    )
                if (!conversations) throw CreateError$1(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                const [message] = await db$2
                    .insert(table$2.messages)
                    .values({
                        content: trimmedContent,
                        sender: userId,
                        conversation: conversations.id
                    })
                    .returning()
                await db$2
                    .update(table$2.conversations)
                    .set({ updatedAt: /* @__PURE__ */ new Date() })
                    .where((0, drizzle_orm.eq)(table$2.conversations.id, conversationId))
                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_created", toTypeBox(message), conversations.id)
                }
                return reply.code(201).send(toTypeBox(message))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/message/index.ts
function Message(fastify) {
    DeleteMessage(fastify)
    EditMessage(fastify)
    GetMessages(fastify)
    ReadMessage(fastify)
    SendMessage(fastify)
}
//#endregion
//#region src/routes/user/get-user-by-id.ts
function GetUserByID(fastify) {
    fastify.route({
        method: "GET",
        url: "/users/:id",
        schema: {
            description: "Get specific user profile",
            tags: ["Users"],
            params: typebox.Type.Object({ id: UUID }),
            response: {
                200: PublicUser,
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                404: ErrorResponse$1(404, "Not found - User not found error"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const [user] = await db$2
                    .select()
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                if (!user) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                return reply.status(200).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/user/get-users.ts
function GetUsers(fastify) {
    fastify.route({
        method: "POST",
        url: "/users",
        schema: {
            description: "Get list of all users",
            tags: ["Users"],
            querystring: typebox.Type.Partial(
                typebox.Type.Object({
                    page: typebox.Type.Integer({
                        default: 1,
                        minimum: 1
                    }),
                    limit: typebox.Type.Integer({
                        maximum: 100,
                        minimum: 1
                    }),
                    search: typebox.Type.String()
                })
            ),
            body: Nullable(
                typebox.Type.Array(UUID, {
                    maxItems: 100,
                    minItems: 0
                })
            ),
            response: {
                200: typebox.Type.Array(PublicUser, {
                    maxItems: 100,
                    minItems: 0
                }),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        config: {
            rateLimit: {
                max: 100,
                timeWindow: "1 minute"
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20, search } = request.query
                const id = request.body
                const conditions = []
                if (id && id.length)
                    conditions.push((0, drizzle_orm.or)(...id.map((x) => (0, drizzle_orm.eq)(table$2.users.id, x))))
                if (search) {
                    const il1 = (0, drizzle_orm.ilike)(table$2.users.username, `%${search}%`)
                    const il2 = (0, drizzle_orm.ilike)(table$2.users.name, `%${search}%`)
                    conditions.push((0, drizzle_orm.or)(il1, il2))
                }
                const whereClause = conditions.length > 0 ? (0, drizzle_orm.and)(...conditions) : void 0
                const offset = (page - 1) * limit
                const user = await db$2
                    .select()
                    .from(table$2.users)
                    .where(whereClause)
                    .orderBy((0, drizzle_orm.desc)(table$2.users.createdAt))
                    .limit(limit)
                    .offset(offset)
                return reply.status(200).send(user.map((x) => toTypeBox(x)))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/user/index.ts
function User(fastify) {
    GetUsers(fastify)
    GetUserByID(fastify)
}
//#endregion
//#region src/routes/auth/change-password.ts
function ChangePassword(fastify) {
    fastify.route({
        method: "PATCH",
        url: "/auth/user/password",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: ChangeUserPassword,
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse$1(403, "Forbidden - Incorrect password or user is banned"),
                404: ErrorResponse$1(404, "Not Found - User Not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { oldPassword, newPassword } = request.body
                const { id } = request.payload
                const [oldUser] = await db$2
                    .select()
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                if (!oldUser) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                if (oldUser.ban)
                    throw CreateError$1(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                if (
                    !(0, node_crypto.timingSafeEqual)(
                        Buffer.from(oldUser.password),
                        Buffer.from(HmacPassword(oldPassword))
                    )
                )
                    throw CreateError$1(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                const [newUser] = await db$2
                    .update(table$2.users)
                    .set({ password: HmacPassword(newPassword) })
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                    .returning()
                return reply.status(200).send(toTypeBox(newUser))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/change-email.ts
function ChangeEmail(fastify) {
    fastify.route({
        method: "PATCH",
        url: "/auth/user/email",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: ChangeUserEmail,
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse$1(403, "Forbidden - Incorrect password or user is banned"),
                404: ErrorResponse$1(404, "Not Found - User Not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { email, password } = request.body
                const { id } = request.payload
                const [oldUser] = await db$2
                    .select()
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                if (!oldUser) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                if (oldUser.ban)
                    throw CreateError$1(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                if (
                    !(0, node_crypto.timingSafeEqual)(
                        Buffer.from(oldUser.password),
                        Buffer.from(HmacPassword(password))
                    )
                )
                    throw CreateError$1(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                const [newUser] = await db$2
                    .update(table$2.users)
                    .set({ email })
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                    .returning()
                return reply.status(200).send(toTypeBox(newUser))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/update-user.ts
function UpdateUser(fastify) {
    fastify.route({
        method: "PATCH",
        url: "/auth/user",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: ChangeUserInfo,
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse$1(403, "Forbidden - User is banned"),
                404: ErrorResponse$1(404, "Not Found - User Not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.payload
                const data = request.body
                if (!data.avatar) data.avatar = null
                const [oldUser] = await db$2
                    .select()
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                if (!oldUser) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                if (oldUser.ban)
                    throw CreateError$1(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                const [newUser] = await db$2
                    .update(table$2.users)
                    .set(data)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                    .returning()
                return reply.status(200).send(toTypeBox(newUser))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/register.ts
function Register(fastify) {
    fastify.route({
        method: "POST",
        url: "/auth/register",
        schema: {
            description: "Register a new user account with OTP verification",
            tags: ["Authentication"],
            body: RegisterUser,
            response: {
                201: AuthenticatedUser,
                400: ErrorResponse$1(400, "Bad Request - Invalid input data"),
                409: ErrorResponse$1(409, "Conflict - Email or username already exists"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        handler: async (request, reply) => {
            const { email, username, password } = request.body
            try {
                const [exist] = await db$2
                    .select({
                        email: table$2.users.email,
                        username: table$2.users.username
                    })
                    .from(table$2.users)
                    .where(
                        (0, drizzle_orm.or)(
                            (0, drizzle_orm.ilike)(table$2.users.email, email),
                            (0, drizzle_orm.ilike)(table$2.users.username, username)
                        )
                    )
                if (exist) {
                    if (exist.email.toLowerCase() === email.toLowerCase())
                        throw CreateError$1(409, "EMAIL_ALREADY_EXISTS", "This email is already registered")
                    if (exist.username.toLowerCase() === username.toLowerCase())
                        throw CreateError$1(409, "USERNAME_ALREADY_EXISTS", "This username is already taken")
                }
                const [user] = await db$2
                    .insert(table$2.users)
                    .values({
                        ...request.body,
                        password: HmacPassword(password)
                    })
                    .returning()
                if (!user) throw CreateError$1(500, "USER_CREATION_FAILED", "Failed to create user account")
                const exp = 86400
                const now = Math.floor(Date.now() / 1e3)
                const payload = {
                    id: user.id,
                    iat: now,
                    exp: now + exp
                }
                const jwt = fastify.jwt.sign(payload)
                reply.setCookie("auth", jwt, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: exp,
                    path: "/"
                })
                return reply.status(201).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/logout.ts
function Logout(fastify) {
    fastify.route({
        method: "POST",
        url: "/auth/logout",
        schema: {
            description: "Logout user and clear authentication",
            tags: ["Authentication"],
            response: {
                200: typebox.Type.Object({ success: typebox.Type.Boolean() }),
                401: ErrorResponse$1(401, "Unauthorized - authentication required"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (_, reply) => {
            try {
                reply.clearCookie("auth", {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/"
                })
                return reply.send({
                    success: true,
                    message: "Successfully logged out"
                })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/login.ts
function Login$1(fastify) {
    fastify.route({
        method: "POST",
        url: "/auth/login",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: LoginUser,
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse$1(403, "Forbidden - Incorrect username/email or password or user is banned"),
                404: ErrorResponse$1(404, "Not Found - User Not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        handler: async (request, reply) => {
            try {
                const { input, password } = request.body
                const [user] = await db$2
                    .select()
                    .from(table$2.users)
                    .where(
                        (0, drizzle_orm.or)(
                            (0, drizzle_orm.ilike)(table$2.users.email, input),
                            (0, drizzle_orm.ilike)(table$2.users.username, input)
                        )
                    )
                if (!user) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                if (user.ban)
                    throw CreateError$1(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${user.ban} Contact support for more information.`
                    )
                if (!(0, node_crypto.timingSafeEqual)(Buffer.from(user.password), Buffer.from(HmacPassword(password))))
                    throw CreateError$1(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                const exp = 86400
                const now = Math.floor(Date.now() / 1e3)
                const payload = {
                    id: user.id,
                    iat: now,
                    exp: now + exp
                }
                const jwt = fastify.jwt.sign(payload)
                reply.setCookie("auth", jwt, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: exp,
                    path: "/"
                })
                return reply.status(200).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/me.ts
function Login(fastify) {
    fastify.route({
        method: "GET",
        url: "/auth/me",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse$1(403, "Forbidden - User is banned"),
                404: ErrorResponse$1(404, "Not Found - User Not found"),
                429: ErrorResponse$1(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse$1(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.payload
                const [user] = await db$2
                    .select()
                    .from(table$2.users)
                    .where((0, drizzle_orm.eq)(table$2.users.id, id))
                if (user.ban)
                    throw CreateError$1(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${user.ban} Contact support for more information.`
                    )
                if (!user) throw CreateError$1(404, "USER_NOT_FOUND", "User not found")
                return reply.status(200).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
//#endregion
//#region src/routes/auth/index.ts
function Auth(fastify) {
    ChangePassword(fastify)
    ChangeEmail(fastify)
    UpdateUser(fastify)
    Register(fastify)
    Logout(fastify)
    Login$1(fastify)
    Login(fastify)
}
//#endregion
//#region src/routes/index.ts
function Routes(fastify) {
    fastify.get(
        "/status",
        {
            logLevel: "silent",
            config: { rateLimit: false }
        },
        (_, reply) => reply.send("OK")
    )
    fastify.get("/license", () => `Search it up, it's MIT`)
    fastify.get("/terms", () => "ToS?? Forget about it")
    Conversation(fastify)
    Message(fastify)
    User(fastify)
    Auth(fastify)
}
//#endregion
//#region src/plugin/socket-io.ts
async function socket(fastify) {
    await fastify.register(fastify_socket.default, {
        cookie: true,
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:7700",
            credentials: true
        }
    })
}
//#endregion
//#region package.json
var version = "0.0.1"
//#endregion
//#region src/plugin/swagger.ts
async function swagger(fastify) {
    await fastify.register(_fastify_swagger.default, {
        hideUntagged: true,
        openapi: {
            openapi: "3.1.1",
            info: {
                title: "Chatio",
                version
            }
        }
    })
}
//#endregion
//#region src/plugin/cookie.ts
async function cookie(fastify) {
    await fastify.register(_fastify_cookie.default, { secret: process.env.COOKIE_SECRET })
}
//#endregion
//#region src/plugin/rate-limit.ts
async function rl(fastify) {
    await fastify.register(_fastify_rate_limit.default, {
        max: 100,
        timeWindow: 2e4,
        allowList: ["127.0.0.1"],
        keyGenerator: (req) => {
            const forwarded = req.headers["x-forwarded-for"]
            return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip
        }
    })
}
//#endregion
//#region src/plugin/scalar.ts
async function scalar(fastify) {
    await fastify.register(_scalar_fastify_api_reference.default, {
        routePrefix: "/",
        configuration: {
            theme: "deepSpace",
            layout: "modern",
            hideModels: true,
            hideTestRequestButton: true,
            hideClientButton: true,
            showSidebar: true,
            showDeveloperTools: "never",
            operationTitleSource: "summary",
            persistAuth: false,
            telemetry: false,
            isEditable: false,
            isLoading: false,
            documentDownloadType: "both",
            hideSearch: false,
            showOperationId: false,
            hideDarkModeToggle: false,
            withDefaultFonts: true,
            defaultOpenFirstTag: false,
            defaultOpenAllTags: false,
            expandAllModelSections: false,
            expandAllResponses: false,
            orderSchemaPropertiesBy: "alpha",
            orderRequiredPropertiesFirst: true,
            _integration: "fastify",
            default: false,
            hiddenClients: true,
            slug: "api",
            title: "api",
            mcp: { disabled: true },
            agent: { disabled: true }
        }
    })
}
//#endregion
//#region src/plugin/cors.ts
async function cors(fastify) {
    await fastify.register(_fastify_cors.default, {
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        origin: (origin, cb) => cb(null, true)
    })
}
//#endregion
//#region src/plugin/jwt.ts
async function jwt(fastify) {
    await fastify.register(_fastify_jwt.default, {
        cookie: {
            cookieName: "auth",
            signed: true
        },
        secret: process.env.COOKIE_SECRET
    })
}
//#endregion
//#region src/plugin/index.ts
async function Plugin(fastify) {
    await swagger(fastify)
    await scalar(fastify)
    await rl(fastify)
    await socket(fastify)
    await cookie(fastify)
    await jwt(fastify)
    await cors(fastify)
}
//#endregion
//#region src/socket/user-status.ts
async function UserStatusChanged(socket) {
    try {
        const { user } = socket
        const conversations = await db$2
            .select()
            .from(table$2.conversations)
            .where((0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id]))
        const relatedUserIds = Array.from(
            new Set(conversations.map((x) => x.users.filter((c) => c !== user.id).shift() ?? ""))
        )
        for (const userId of relatedUserIds) {
            socket.to(userId).emit("user_status_changed", user.id, "online")
            if ((await socket.in(userId).fetchSockets()).length > 0)
                socket.emit("user_status_changed", userId, "online")
        }
        socket.on("disconnect", () => {
            for (const userId of relatedUserIds) socket.to(userId).emit("user_status_changed", user.id, "offline")
        })
    } catch (error) {
        console.error(error)
        socket.emit("errors", "Internal Server Error")
    }
}
//#endregion
//#region src/socket/typing.ts
async function TypingStatusChanged(socket) {
    socket.on("typing", async (conversationId, status) => {
        try {
            const { user } = socket
            const [conversation] = await db$2
                .select()
                .from(table$2.conversations)
                .where(
                    (0, drizzle_orm.and)(
                        (0, drizzle_orm.eq)(table$2.conversations.id, conversationId),
                        (0, drizzle_orm.arrayContains)(table$2.conversations.users, [user.id])
                    )
                )
            if (!conversation) return socket.emit("errors", "Conversation not found")
            const toSend = conversation.users.filter((x) => x !== user.id)
            socket.to(toSend).emit("typing", user.id, conversation.id, status)
        } catch (error) {
            console.error(error)
            socket.emit("errors", "Internal Server Error")
        }
    })
}
//#endregion
//#region src/socket/index.ts
var socket_default = (fastify) => async (socket) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie ?? ""
        const { auth } = fastify.parseCookie(cookieHeader)
        if (!auth) {
            socket.emit("errors", "AUTH_TOKEN_MISSING")
            socket.disconnect(true)
            return
        }
        const tokenParts = auth.split(".")
        const cleanToken = tokenParts.length >= 3 ? tokenParts.slice(0, 3).join(".") : auth
        const { id } = fastify.jwt.verify(cleanToken)
        const [user] = await db$2
            .select()
            .from(table$2.users)
            .where(
                (0, drizzle_orm.and)(
                    (0, drizzle_orm.isNull)(table$2.users.ban),
                    (0, drizzle_orm.eq)(table$2.users.id, id)
                )
            )
        if (!user) {
            socket.emit("errors", "USER_NOT_FOUND")
            socket.disconnect(true)
        }
        socket.user = user
        socket.join(socket.user.id)
        UserStatusChanged(socket)
        TypingStatusChanged(socket)
    } catch (error) {
        console.error(`Socket ${socket.id} authentication failed:`, error)
        socket.emit("errors", "Invalid authentication token")
        socket.disconnect(true)
        return
    }
}
//#endregion
//#region src/hooks/error.ts
async function error(fastify) {
    fastify.addHook("onError", (_, __, error) => {
        if ((Error.isError(error) && error.message.startsWith("Rate limit exceeded")) || isFastifyError$1(error))
            throw error
        else {
            console.trace(error)
            throw CreateError$1(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
        }
    })
}
//#endregion
//#region src/hooks/index.ts
async function Hooks(fastify) {
    await error(fastify)
}
//#endregion
//#region ../../../api/others/type.ts
const ErrorResponse = typebox.Type.Object({
    statusCode: typebox.Type.Number(),
    error: typebox.Type.String(),
    message: typebox.Type.String(),
    details: typebox.Type.Optional(typebox.Type.Any())
})
//#endregion
//#region ../../../api/others/routine/type.ts
const ClassSchedule = typebox.Type.Object({
    time: typebox.Type.String(),
    subject: typebox.Type.String(),
    teacher: typebox.Type.String(),
    classroom: typebox.Type.String()
})
const DailySchedule = typebox.Type.Object({
    1: ClassSchedule,
    2: ClassSchedule,
    3: ClassSchedule,
    4: ClassSchedule,
    5: ClassSchedule,
    6: ClassSchedule,
    7: ClassSchedule
})
const CodeType = typebox.Type.TemplateLiteral([
    typebox.Type.Union([
        typebox.Type.Literal("67"),
        typebox.Type.Literal("68"),
        typebox.Type.Literal("69"),
        typebox.Type.Literal("72"),
        typebox.Type.Literal("85"),
        typebox.Type.Literal("92")
    ]),
    typebox.Type.Literal("-"),
    typebox.Type.Union([
        typebox.Type.Literal("1"),
        typebox.Type.Literal("2"),
        typebox.Type.Literal("3"),
        typebox.Type.Literal("4"),
        typebox.Type.Literal("5"),
        typebox.Type.Literal("6"),
        typebox.Type.Literal("7")
    ]),
    typebox.Type.Union([typebox.Type.Literal("A"), typebox.Type.Literal("B")]),
    typebox.Type.Union([typebox.Type.Literal("1"), typebox.Type.Literal("2")])
])
const RoutineData = typebox.Type.Object({
    code: CodeType,
    load: typebox.Type.String(),
    class: typebox.Type.Object({
        Sunday: DailySchedule,
        Monday: DailySchedule,
        Tuesday: DailySchedule,
        Wednesday: DailySchedule,
        Thursday: DailySchedule
    }),
    teacher: typebox.Type.Array(
        typebox.Type.Object({
            name: typebox.Type.String(),
            designation: typebox.Type.String(),
            mobile: typebox.Type.String(),
            subject: typebox.Type.String()
        })
    )
})
const PostBody$1 = typebox.Type.Object({
    year: typebox.Type.String(),
    department: typebox.Type.String(),
    semester: typebox.Type.String(),
    shift: typebox.Type.String(),
    group: typebox.Type.String()
})
const PutQuery = typebox.Type.Object({
    key: typebox.Type.String(),
    year: typebox.Type.Optional(typebox.Type.String())
})
const PutResponse$1 = typebox.Type.Optional(
    typebox.Type.Object({
        id: typebox.Type.String(),
        message: typebox.Type.String()
    })
)
const PostSchema$1 = {
    body: PostBody$1,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: RoutineData
    }
}
const PutSchema$1 = {
    querystring: PutQuery,
    body: RoutineData,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        201: PutResponse$1
    }
}
//#endregion
//#region ../../../api/others/function/error.ts
/**
 * Type guard to check if a given error is a FastifyError.
 *
 * This function ensures type narrowing in TypeScript by returning
 * a type predicate. It is useful when handling errors in Fastify
 * applications to distinguish Fastify-specific errors from generic ones.
 *
 * @param {any} error - The error object to check
 * @returns {error is FastifyError} True if the error is an instance of FastifyError, otherwise false
 *
 * @example
 * ```typescript
 * try {
 *   // Some Fastify operation
 * } catch (error) {
 *   if (isFastifyError(error)) throw error
 *   console.trace(error);
 * }
 * ```
 */
function isFastifyError(error) {
    return error instanceof _fastify_error.FastifyError
}
/**
 * Creates a custom Fastify error using @fastify/error factory
 *
 * This function creates properly formatted Fastify errors that work seamlessly
 * with Fastify's error handling and serialization system.
 *
 * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
 * @param {string} code - Unique error code identifier (e.g., 'USER_NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @param {Record<string, any>} [details] - Optional additional error details
 *
 * @returns {Error} Fastify-compatible error instance
 *
 * @example
 * ```typescript
 * // Create and throw an error
 * throw CreateError(404, 'USER_NOT_FOUND', 'User not found', { userId: '123' });
 *
 * // Create error for conditional throwing
 * const error = CreateError(400, 'VALIDATION_ERROR', 'Invalid input');
 * if (shouldThrow) throw error;
 * ```
 */
function CreateError(statusCode, code, message, details) {
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600)
        throw new TypeError("statusCode must be a valid HTTP status code (100-599)")
    if (!code || typeof code !== "string" || code.trim().length === 0)
        throw new TypeError("code must be a non-empty string")
    if (!message || typeof message !== "string" || message.trim().length === 0)
        throw new TypeError("message must be a non-empty string")
    const errorInstance = new ((0, _fastify_error.default)(code.trim().toUpperCase(), message, statusCode))()
    if (details && Object.keys(details).length > 0) Object.assign(errorInstance, { details: { ...details } })
    return errorInstance
}
//#endregion
//#region ../../../api/others/routine/database/routine.ts
const routine = (0, drizzle_orm_pg_core.pgTable)(
    "routine",
    {
        id: (0, drizzle_orm_pg_core.uuid)("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => (0, uuid.v7)()),
        year: (0, drizzle_orm_pg_core.char)("year", { length: 4 })
            .notNull()
            .$defaultFn(() => /* @__PURE__ */ new Date().getFullYear().toString()),
        code: (0, drizzle_orm_pg_core.char)("code", { length: 6 }).notNull(),
        load: (0, drizzle_orm_pg_core.varchar)("load").notNull(),
        class: (0, drizzle_orm_pg_core.jsonb)("class").$type().notNull(),
        teacher: (0, drizzle_orm_pg_core.jsonb)("teacher").$type().notNull()
    },
    (table) => [
        (0, drizzle_orm_pg_core.check)(
            "code_pattern",
            drizzle_orm.sql`${table.code} ~ '^(67|68|69|72|85|92)-[1-7][AB][12]$'`
        )
    ]
)
//#endregion
//#region ../../../api/others/routine/database/index.ts
const db$1 = (0, drizzle_orm_postgres_js.drizzle)({ client: (0, postgres.default)(process.env.DATABASE_URI) })
const table$1 = { routine }
//#endregion
//#region ../../../api/others/routine/routes/post.ts
async function post$1(request, reply) {
    try {
        const { year, department, semester, shift, group } = request.body
        const [data] = await db$1
            .select()
            .from(table$1.routine)
            .where(
                (0, drizzle_orm.and)(
                    (0, drizzle_orm.eq)(table$1.routine.year, year),
                    (0, drizzle_orm.eq)(table$1.routine.code, `${department}-${semester}${group}${shift}`)
                )
            )
        if (!data) throw CreateError(404, "ROUTINE_NOT_FOUND", "Routine not found")
        return reply.code(200).send(data)
    } catch (error) {
        if (isFastifyError(error)) throw error
        console.trace(error)
        throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}
//#endregion
//#region ../../../api/others/routine/routes/put.ts
async function put$1(request, reply) {
    try {
        const routine = request.body
        const { key, year } = request.query
        if (key !== process.env.SECRET) throw CreateError(403, "FORBIDDEN", "Forbidden")
        const [result] = await db$1
            .insert(table$1.routine)
            .values({
                ...routine,
                year
            })
            .returning()
        return reply.code(201).send({
            id: result.id,
            message: "Routine Created successfully"
        })
    } catch (error) {
        if (isFastifyError(error)) throw error
        console.trace(error)
        throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}
//#endregion
//#region ../../../api/others/routine/index.ts
function Routine(fastify) {
    fastify.route({
        method: "POST",
        url: "/routine",
        schema: PostSchema$1,
        handler: post$1
    })
    fastify.route({
        method: "PUT",
        url: "/routine",
        schema: PutSchema$1,
        handler: put$1
    })
}
//#endregion
//#region ../../../api/others/vaultly/type.ts
const PostBody = typebox.Type.Object({
    id: typebox.Type.String(),
    key: typebox.Type.String()
})
const PostResponse = typebox.Type.Object({
    id: typebox.Type.String(),
    message: typebox.Type.String()
})
const PutBody = typebox.Type.Object({
    key: typebox.Type.String(),
    message: typebox.Type.String(),
    expires: typebox.Type.Optional(typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])),
    one_time: typebox.Type.Optional(typebox.Type.Boolean())
})
const PutResponse = typebox.Type.Object({
    id: typebox.Type.String(),
    message: typebox.Type.String(),
    expires: typebox.Type.Optional(typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])),
    one_time: typebox.Type.Optional(typebox.Type.Boolean())
})
const PostSchema = {
    body: PostBody,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: PostResponse
    }
}
const PutSchema = {
    body: PutBody,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: PutResponse
    }
}
//#endregion
//#region ../../../api/others/vaultly/database/message.ts
const message = (0, drizzle_orm_pg_core.pgTable)(
    "message",
    {
        id: (0, drizzle_orm_pg_core.uuid)("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => (0, uuid.v7)()),
        key: (0, drizzle_orm_pg_core.char)("key", { length: 128 }).notNull(),
        message: (0, drizzle_orm_pg_core.text)("message").notNull(),
        one_time: (0, drizzle_orm_pg_core.boolean)("one_time").default(false),
        expires: (0, drizzle_orm_pg_core.timestamp)("expires", { mode: "date" })
    },
    (table) => [(0, drizzle_orm_pg_core.check)("key_length", drizzle_orm.sql`length(${table.key}) = 128`)]
)
//#endregion
//#region ../../../api/others/vaultly/database/index.ts
const db = (0, drizzle_orm_postgres_js.drizzle)({ client: (0, postgres.default)(process.env.DATABASE_URI) })
const table = { message }
//#endregion
//#region ../../../api/others/vaultly/routes/post.ts
async function post(request, reply) {
    try {
        const { id, key } = request.body
        if (!(0, uuid.validate)(id)) return reply.code(400).send({ error: "Invalid ID format" })
        const message = (
            await db
                .select()
                .from(table.message)
                .where((0, drizzle_orm.eq)(table.message.id, id))
        ).shift()
        const hmac = (0, node_crypto.createHmac)("sha512", process.env.SECRET).update(key).digest("hex")
        if (!message) return reply.code(404).send({ error: "Message not found" })
        if (message.key !== hmac) return reply.code(403).send({ error: "Invalid key" })
        if (message.expires && new Date(message.expires) < /* @__PURE__ */ new Date()) {
            await db.delete(table.message).where((0, drizzle_orm.eq)(table.message.id, id))
            return reply.code(410).send({ error: "Message expired" })
        }
        if (message.one_time) await db.delete(table.message).where((0, drizzle_orm.eq)(table.message.id, id))
        return {
            id: message.id,
            message: decrypt(message.key, message.message)
        }
    } catch (error) {
        console.log(error)
        return reply.code(500).send({ error: "Internal Server Error" })
    }
}
function decrypt(hmac, encryptedData) {
    const [encrypted, ivHex] = encryptedData.split(":")
    if (!encrypted || !ivHex) throw new Error("Invalid encrypted data format")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = (0, node_crypto.createDecipheriv)(
        "aes-256-cbc",
        (0, node_crypto.scryptSync)(process.env.SECRET, hmac, 32),
        iv
    )
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}
//#endregion
//#region ../../../api/others/vaultly/routes/put.ts
async function put(request, reply) {
    try {
        const { key, message, expires = null, one_time = false } = request.body
        const hmac = (0, node_crypto.createHmac)("sha512", process.env.SECRET).update(key).digest("hex")
        const encrypted = encrypt(hmac, message)
        const [data] = await db
            .insert(table.message)
            .values({
                key: hmac,
                message: encrypted,
                expires: expires ? new Date(expires) : null,
                one_time: Boolean(one_time)
            })
            .returning()
        return {
            id: data.id,
            message,
            expires,
            one_time
        }
    } catch (error) {
        console.log(error)
        return reply.code(500).send({ error: "Internal Server Error" })
    }
}
function encrypt(hmac, text) {
    const iv = (0, node_crypto.randomBytes)(16)
    const cipher = (0, node_crypto.createCipheriv)(
        "aes-256-cbc",
        (0, node_crypto.scryptSync)(process.env.SECRET, hmac, 32),
        iv
    )
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return `${encrypted}:${iv.toString("hex")}`
}
//#endregion
//#region ../../../api/others/vaultly/index.ts
function Vaultly(fastify) {
    fastify.route({
        method: "POST",
        url: "/vaultly",
        schema: PostSchema,
        handler: post
    })
    fastify.route({
        method: "PUT",
        url: "/vaultly",
        schema: PutSchema,
        handler: put
    })
}
//#endregion
//#region ../../../api/others/xcfbot/routes/auth.ts
async function auth(request, reply) {
    throw CreateError(501, "NOT_IMPLEMENTED", "Implemented")
}
//#endregion
//#region ../../../api/others/xcfbot/index.ts
function xcfbot(fastify) {
    fastify.route({
        method: "POST",
        url: "/xcfbot/auth",
        schema: {
            response: {
                "4xx": ErrorResponse,
                "5xx": ErrorResponse
            }
        },
        handler: auth
    })
}
//#endregion
//#region ../../../api/others/support/type.ts
const categories = {
    feature: "Feature Request",
    general: "General",
    bug: "Bug Report"
}
const WishlistSchema = {
    body: typebox.Type.Object({
        fullName: typebox.Type.String({
            minLength: 2,
            maxLength: 100
        }),
        email: typebox.Type.String({
            format: "email",
            maxLength: 255,
            description: "Valid email address"
        })
    }),
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: typebox.Type.Object({
            success: typebox.Type.Boolean(),
            message: typebox.Type.String()
        })
    }
}
const SupportSchema = {
    body: typebox.Type.Object({
        name: typebox.Type.String({
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z\\s]+$",
            description: "Full name (letters and spaces only)"
        }),
        email: typebox.Type.String({
            format: "email",
            maxLength: 255,
            description: "Valid email address"
        }),
        category: typebox.Type.Union(
            Object.keys(categories).map((x) => typebox.Type.Literal(x)),
            { description: "Message category" }
        ),
        subject: typebox.Type.String({
            minLength: 5,
            maxLength: 200,
            description: "Message subject"
        }),
        message: typebox.Type.String({
            minLength: 10,
            maxLength: 3800,
            description: "Message content"
        })
    }),
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: typebox.Type.Object({
            success: typebox.Type.Boolean(),
            message: typebox.Type.String()
        })
    }
}
//#endregion
//#region ../../../api/others/support/index.ts
const client = new snowtransfer.SnowTransfer(process.env.TOKEN)
function Support(fastify) {
    fastify.route({
        method: "POST",
        url: "/support",
        schema: SupportSchema,
        handler: async function (request, reply) {
            try {
                const { name, email, category, subject, message } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"
                await client.channel.createMessage(process.env.CHANNEL, {
                    flags: discord_api_types_v10.MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: discord_api_types_v10.ComponentType.Container,
                            components: [
                                {
                                    type: discord_api_types_v10.ComponentType.TextDisplay,
                                    content: `## ${categories[category] ?? "Support"} - ${subject}`
                                },
                                { type: discord_api_types_v10.ComponentType.Separator },
                                {
                                    type: discord_api_types_v10.ComponentType.TextDisplay,
                                    content: `**Name:** ${name}\n**Email:** ${email}\n**Subject:** ${subject}\n**Origin:** ${host}\n\n**Message:**\n${message}`
                                }
                            ]
                        }
                    ]
                })
                return reply.status(200).send({
                    success: true,
                    message: "Support request submitted successfully"
                })
            } catch (error) {
                if (isFastifyError(error)) throw error
                else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
    fastify.route({
        method: "POST",
        url: "/wishlist",
        schema: WishlistSchema,
        handler: async function (request, reply) {
            try {
                const { fullName, email } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"
                await client.channel.createMessage(process.env.CHANNEL, {
                    flags: discord_api_types_v10.MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: discord_api_types_v10.ComponentType.Container,
                            components: [
                                {
                                    type: discord_api_types_v10.ComponentType.TextDisplay,
                                    content: `Wishlist Signup`
                                },
                                { type: discord_api_types_v10.ComponentType.Separator },
                                {
                                    type: discord_api_types_v10.ComponentType.TextDisplay,
                                    content: `**Name:** ${fullName}\n**Email:** ${email}\n**Origin:** ${host}\n**Timestamp:** ${/* @__PURE__ */ new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}`
                                }
                            ]
                        }
                    ]
                })
                return reply.status(200).send({
                    success: true,
                    message: "Successfully joined the wishlist"
                })
            } catch (error) {
                if (isFastifyError(error)) throw error
                else {
                    console.trace(error)
                    throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}
//#endregion
//#region ../../../api/others/index.ts
function Others(fastify) {
    Routine(fastify)
    Support(fastify)
    Vaultly(fastify)
    xcfbot(fastify)
}
//#endregion
//#region src/index.ts
let io
async function main() {
    const fastify$1 = (0, fastify.default)({
        trustProxy: true,
        logger:
            process.env.NODE_ENV === "development"
                ? {
                      transport: {
                          target: "pino-pretty",
                          options: {
                              translateTime: "HH:MM:ss Z",
                              ignore: "pid,hostname"
                          }
                      }
                  }
                : true,
        schemaErrorFormatter: fastify_utils.ValidationErrorHandler
    }).withTypeProvider()
    await Plugin(fastify$1)
    Decorate(fastify$1)
    Routes(fastify$1)
    Hooks(fastify$1)
    Others(fastify$1)
    const port = Number(process.env.PORT ?? 7200)
    await fastify$1.listen({
        host: "0.0.0.0",
        port
    })
    console.log(`Server listening at http://localhost:${port}`)
    fastify$1.io.on("connection", socket_default(fastify$1))
    io = fastify$1.io
    return fastify$1
}
process.on("uncaughtException", (err, origin) => xcf(err, "Uncaught Exception", origin, false))
process.on("unhandledRejection", (reason, origin) => xcf(reason, "Unhandled Rejection", origin, false))
process.on("uncaughtExceptionMonitor", (err, origin) => xcf(err, "Uncaught Exception", origin, false))
main()
//#endregion
Object.defineProperty(exports, "io", {
    enumerable: true,
    get: function () {
        return io
    }
})
exports.main = main
