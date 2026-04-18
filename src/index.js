"use strict"
var __create = Object.create
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __getProtoOf = Object.getPrototypeOf
var __hasOwnProp = Object.prototype.hasOwnProperty
var __export = (target, all) => {
    for (var name in all) __defProp(target, name, { get: all[name], enumerable: true })
}
var __copyProps = (to, from, except, desc3) => {
    if ((from && typeof from === "object") || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, {
                    get: () => from[key],
                    enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable
                })
    }
    return to
}
var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
        // If the importer is in node compatibility mode or this is not an ESM
        // file that has been converted to a CommonJS file using a Babel-
        // compatible transform (i.e. "__esModule" has not been set), then set
        // "default" to the CommonJS "module.exports" for node compatibility.
        isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
        mod
    )
)
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod)

// src/index.ts
var index_exports = {}
__export(index_exports, {
    io: () => io,
    main: () => main
})
module.exports = __toCommonJS(index_exports)

// src/function/discord.ts
var import_v10 = require("discord-api-types/v10")
var import_snowtransfer = require("snowtransfer")
var client = new import_snowtransfer.SnowTransfer(process.env.TOKEN, {
    allowed_mentions: {
        replied_user: true,
        parse: [
            import_v10.AllowedMentionsTypes.Everyone,
            import_v10.AllowedMentionsTypes.Role,
            import_v10.AllowedMentionsTypes.User
        ]
    }
})

// src/function/error.ts
var import_snowtransfer2 = require("snowtransfer")
var import_error = require("@fastify/error")
var import_node_util = require("node:util")
var import_error2 = __toESM(require("@fastify/error"))
var import_v102 = require("discord-api-types/v10")

// src/type.ts
var FrontendError = class extends Error {
    constructor({ name, message: message2, stack, cause }) {
        super()
        this.name = name
        this.message = message2
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

// src/function/error.ts
function isFastifyError(error2) {
    return error2 instanceof import_error.FastifyError
}
function CreateError(statusCode, code, message2, details) {
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600) {
        throw new TypeError("statusCode must be a valid HTTP status code (100-599)")
    }
    if (!code || typeof code !== "string" || code.trim().length === 0) {
        throw new TypeError("code must be a non-empty string")
    }
    if (!message2 || typeof message2 !== "string" || message2.trim().length === 0) {
        throw new TypeError("message must be a non-empty string")
    }
    const error2 = new ((0, import_error2.default)(code.trim().toUpperCase(), message2, statusCode))()
    if (details && Object.keys(details).length > 0) {
        Object.assign(error2, { details: { ...details } })
    }
    return error2
}
async function xcf(givenError, type = "Uncaught Exception", origin, shouldThrow = true) {
    const error2 = givenError
    if (isFastifyError(error2)) throw error2
    if (error2 instanceof import_snowtransfer2.DiscordAPIError) return await handleDiscordAPIError(error2, shouldThrow)
    if (error2 instanceof FrontendError) return await handleFrontendError(error2, shouldThrow)
    console.trace(error2, origin)
    await reply(type, "```js\n" + error2.stack + "\n```")
    if (shouldThrow) throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function handleDiscordAPIError(error2, shouldThrow) {
    console.log((0, import_node_util.inspect)(error2, { depth: 10, colors: true }))
    console.log(error2.stack)
    let text4
    for (let depth = 10; !text4 || text4.length > 4096; depth--) {
        if (depth > 0) {
            text4 = `\`\`\`js
${(0, import_node_util.inspect)(error2, false, 10)}
${(0, import_node_util.inspect)(error2, false, depth)}`.concat(`
\`\`\``)
            text4 = text4 + "```js\n" + (error2.stack ?? "null") + "\n```"
        } else {
            text4 = "Error is too large to send"
        }
    }
    await reply(`Discord API Error (${error2.code})`, text4)
    if (shouldThrow) throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function handleFrontendError(error2, shouldThrow) {
    await reply(
        "Client Error - Received error from client socket",
        "```json\n" + JSON.stringify(error2, null, 4) + "\n```"
    )
    if (shouldThrow) throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    return null
}
async function reply(type, text4) {
    if (!client || !process.env.ERROR_LOG_CHANNEL) return
    await client.channel.createMessage(process.env.ERROR_LOG_CHANNEL, {
        flags: import_v102.MessageFlags.IsComponentsV2,
        components: [
            {
                type: import_v102.ComponentType.Container,
                components: [
                    {
                        type: import_v102.ComponentType.TextDisplay,
                        content: `### ${type}`
                    },
                    {
                        type: import_v102.ComponentType.Separator,
                        spacing: import_v102.SeparatorSpacingSize.Small
                    },
                    {
                        type: import_v102.ComponentType.TextDisplay,
                        content: text4
                    },
                    {
                        type: import_v102.ComponentType.TextDisplay,
                        content: `-# Time: ${/* @__PURE__ */ new Date().toUTCString()}
-# Origin: [chatio](https://chatio-xcfio.vercel.app)`
                    }
                ]
            }
        ]
    })
}

// src/function/front-end.ts
var SCSS = `
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");

:root {
    --bg-primary: #0d1117;
    --bg-secondary: #161b22;
    --bg-tertiary: #21262d;
    --bg-overlay: rgba(22, 27, 34, 0.8);
    --bg-glass: rgba(22, 27, 34, 0.6);

    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --text-muted: #6e7681;

    --border-primary: #30363d;
    --border-secondary: rgba(48, 54, 61, 0.5);
    --border-accent: rgba(88, 166, 255, 0.3);

    --accent-blue: #58a6ff;
    --accent-blue-bright: #79c0ff;
    --accent-green: #3fb950;
    --accent-orange: #ffa657;
    --accent-red: #f85149;
    --accent-purple: #a5a5ff;

    --get-color: #61affe;
    --post-color: #49cc90;
    --put-color: #fca130;
    --delete-color: #f93e3e;
    --patch-color: #9333ea;
    --options-color: #0d7377;
    --head-color: #9013fe;

    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4);

    --gradient-primary: linear-gradient(135deg, #0a0e16 0%, #0d1117 50%, #161b22 100%);
    --gradient-secondary: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%);
    --gradient-accent: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);

    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.swagger-ui {
    will-change: transform;
    transform: translateZ(0);
    contain: layout style paint;
}

.swagger-ui .top-bar {
    display: none;
}

.swagger-ui {
    background: var(--gradient-primary) !important;
    color: var(--text-primary) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.swagger-ui .info {
    margin: 30px 0 40px 0;
    padding: 30px;
    background: var(--gradient-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 20px;
    color: var(--text-primary);
    box-shadow:
        var(--shadow-lg),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
    &:focus-within {
        outline: 2px solid var(--accent-blue);
        outline-offset: 2px;
    }
}

.swagger-ui .info .title small {
    -webkit-text-fill-color: initial !important;
    background: var(--accent-blue) !important;
    color: var(--text-primary) !important;
    padding: 6px 12px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    margin-left: 12px !important;
    box-shadow: var(--shadow-sm) !important;
}

.swagger-ui .info .title small:last-child {
    background: var(--accent-green) !important;
}

.swagger-ui .info::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-accent);
    border-radius: 20px 20px 0 0;
}

.swagger-ui .info .title {
    color: var(--text-primary) !important;
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: 800;
    margin-bottom: 15px;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.swagger-ui .info .description {
    color: var(--text-secondary);
    font-size: 1.15rem;
    margin: 20px 0;
    line-height: 1.7;
    max-width: 70ch;
}

.swagger-ui .opblock {
    background: var(--bg-overlay) !important;
    border: 1px solid var(--border-secondary) !important;
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: var(--transition-smooth);
    backdrop-filter: blur(12px);
    position: relative;
    will-change: transform, box-shadow;
    isolation: isolate;
}

.swagger-ui .opblock::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    z-index: 1;
}

.swagger-ui .opblock:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px) scale(1.002);
    border-color: var(--border-accent) !important;
    background: rgba(22, 27, 34, 0.95) !important;
}

.swagger-ui .opblock:focus-within {
    outline: 2px solid var(--accent-blue);
    outline-offset: 2px;
}

.swagger-ui .opblock.opblock-get {
    border-left: 4px solid var(--get-color) !important;
    background: linear-gradient(135deg, rgba(97, 175, 254, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-post {
    border-left: 4px solid var(--post-color) !important;
    background: linear-gradient(135deg, rgba(73, 204, 144, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-put {
    border-left: 4px solid var(--put-color) !important;
    background: linear-gradient(135deg, rgba(252, 161, 48, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-delete {
    border-left: 4px solid var(--delete-color) !important;
    background: linear-gradient(135deg, rgba(249, 62, 62, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-patch {
    border-left: 4px solid var(--patch-color) !important;
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-options {
    border-left: 4px solid var(--options-color) !important;
    background: linear-gradient(135deg, rgba(13, 115, 119, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock.opblock-head {
    border-left: 4px solid var(--head-color) !important;
    background: linear-gradient(135deg, rgba(144, 19, 254, 0.12) 0%, var(--bg-overlay) 30%) !important;
}

.swagger-ui .opblock-summary-method {
    border-radius: 8px !important;
    font-weight: 700 !important;
    font-size: 0.75rem !important;
    padding: 8px 14px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    box-shadow: var(--shadow-sm) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
}

.swagger-ui .opblock.opblock-patch .opblock-summary-method,
.swagger-ui .opblock.opblock-patch .opblock-summary .opblock-summary-method {
    background: #9333ea !important;
    background-color: #9333ea !important;
}

.swagger-ui .opblock .opblock-summary {
    color: var(--text-primary) !important;
    padding: 18px 24px !important;
    font-weight: 600;
    font-size: 1.05rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.swagger-ui .opblock-description-wrapper,
.swagger-ui .opblock-external-docs-wrapper,
.swagger-ui .opblock-title_normal {
    color: var(--text-secondary) !important;
}

.swagger-ui .btn {
    border-radius: 12px;
    font-weight: 600;
    transition: var(--transition-smooth);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.85rem;
    position: relative;
    overflow: hidden;
    min-height: 44px;
    &:focus {
        outline: 2px solid var(--accent-blue);
        outline-offset: 2px;
    }
}

.swagger-ui .btn.execute {
    background: linear-gradient(135deg, var(--accent-green) 0%, #2ea043 100%) !important;
    border: none !important;
    color: white !important;
    padding: 14px 28px;
    box-shadow: 0 4px 12px rgba(63, 185, 80, 0.3);
    &[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
        &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            margin: -8px 0 0 -8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.swagger-ui .btn.execute::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.swagger-ui .btn.execute:hover:not([disabled]) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(63, 185, 80, 0.4) !important;
    background: linear-gradient(135deg, #46d164 0%, var(--accent-green) 100%) !important;
}

.swagger-ui .btn.execute:hover:not([disabled])::before {
    left: 100%;
}

.swagger-ui .parameters-col_description,
.swagger-ui .parameter__name,
.swagger-ui .parameter__type {
    color: var(--text-secondary) !important;
}

.swagger-ui .parameter__name.required {
    color: var(--accent-red) !important;
    font-weight: 600 !important;
}

.swagger-ui .parameter__name.required::after {
    content: " *";
    color: var(--accent-red);
    font-weight: bold;
    speak: literal-punctuation;
}

.swagger-ui .parameters-col_name,
.swagger-ui .parameters-col_description {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
}

.swagger-ui .parameter__name {
    color: var(--text-primary) !important;
}

.swagger-ui .parameter__type {
    color: var(--accent-blue) !important;
}

.swagger-ui .parameter__deprecated {
    color: var(--accent-orange) !important;
}

.swagger-ui .parameters thead tr th {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-bottom: 2px solid var(--border-primary) !important;
}

.swagger-ui .responses-inner {
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary) !important;
    border: 1px solid var(--border-secondary) !important;
    backdrop-filter: blur(8px);
}

.swagger-ui .response-col_status {
    font-weight: 700;
    color: var(--text-primary) !important;
    padding: 16px !important;
    background: var(--bg-primary) !important;
    font-family: "JetBrains Mono", "Fira Code", Monaco, monospace;
}

.swagger-ui .response-col_description {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
}

.swagger-ui .responses-table thead tr th {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-bottom: 2px solid var(--border-primary) !important;
}

.swagger-ui .responses-table tbody tr td {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-primary) !important;
}

.swagger-ui .highlight-code {
    border-radius: 16px;
    background: var(--bg-primary) !important;
    border: 1px solid var(--border-primary) !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
    overflow-x: auto;
    font-size: 0.9rem;
    line-height: 1.5;
}

.swagger-ui .highlight-code::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(180deg, rgba(48, 54, 61, 0.3) 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
}

.swagger-ui .microlight {
    color: var(--text-primary) !important;
    font-family: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, monospace !important;
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-break: break-word;
}

.swagger-ui .model-box {
    border-radius: 16px;
    background: var(--bg-glass) !important;
    border: 1px solid var(--border-secondary) !important;
    color: var(--text-primary) !important;
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-md);
    padding: 20px;
}

.swagger-ui .model-title {
    color: var(--text-primary) !important;
    font-weight: 700;
    font-size: 1.15rem;
    margin-bottom: 12px;
}

.swagger-ui .prop-type {
    color: var(--accent-blue-bright) !important;
    font-weight: 600;
    font-family: "JetBrains Mono", "Fira Code", Monaco, monospace;
}

.swagger-ui .prop-format {
    color: var(--text-secondary) !important;
    font-style: italic;
    font-size: 0.9rem;
}

.swagger-ui input[type="text"],
.swagger-ui input[type="password"],
.swagger-ui input[type="email"],
.swagger-ui input[type="number"],
.swagger-ui textarea,
.swagger-ui select {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border: 2px solid var(--border-primary) !important;
    border-radius: 10px;
    padding: 14px 18px;
    transition: var(--transition-smooth);
    font-size: 1rem;
    backdrop-filter: blur(8px);
    line-height: 1.5;
    min-height: 44px;
}

.swagger-ui input[type="text"]:focus,
.swagger-ui input[type="password"]:focus,
.swagger-ui input[type="email"]:focus,
.swagger-ui input[type="number"]:focus,
.swagger-ui textarea:focus,
.swagger-ui select:focus {
    border-color: var(--accent-blue) !important;
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3) !important;
    outline: none !important;
    background: var(--bg-secondary) !important;
    transform: scale(1.01);
}

.swagger-ui .parameters-col_description input,
.swagger-ui .parameter__name input,
.swagger-ui input {
    border: 2px solid var(--border-primary) !important;
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
}

.swagger-ui .parameters-col_description input:focus,
.swagger-ui .parameter__name input:focus,
.swagger-ui input:focus {
    border-color: var(--accent-blue) !important;
    background: var(--bg-secondary) !important;
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3) !important;
}

.swagger-ui input::placeholder,
.swagger-ui textarea::placeholder {
    color: var(--text-muted) !important;
    opacity: 0.8;
}

.swagger-ui .filter .operation-filter-input {
    background: var(--bg-overlay) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-primary) !important;
    border-radius: 16px;
    padding: 18px 24px;
    font-size: 1.05rem;
    transition: var(--transition-smooth);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-md);
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3e%3ccircle cx='11' cy='11' r='8'/%3e%3cpath d='M21 21l-4.35-4.35'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 20px;
    padding-right: 50px;
}

.swagger-ui .filter .operation-filter-input::placeholder {
    color: var(--text-muted) !important;
}

.swagger-ui .filter .operation-filter-input:focus {
    outline: none;
    border-color: var(--accent-blue) !important;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2) !important;
    background-color: rgba(22, 27, 34, 0.95) !important;
    transform: scale(1.02);
}

.swagger-ui .auth-container {
    background: var(--bg-overlay) !important;
    border: 1px solid var(--border-secondary) !important;
    border-radius: 20px;
    padding: 28px;
    margin: 28px 0;
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-lg);
}

.swagger-ui ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.swagger-ui ::-webkit-scrollbar-track {
    background: rgba(22, 27, 34, 0.5);
    border-radius: 8px;
}

.swagger-ui ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #484f58, #6e7681);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: background 0.2s ease;
}

.swagger-ui ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #656c76, #8b949e);
}

.swagger-ui ::-webkit-scrollbar-corner {
    background: rgba(22, 27, 34, 0.5);
}

.swagger-ui table {
    background: var(--bg-glass) !important;
    border: 1px solid var(--border-secondary) !important;
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-md);
    border-spacing: 0;
}

.swagger-ui table th,
.swagger-ui table td {
    border: 1px solid rgba(48, 54, 61, 0.3) !important;
    color: var(--text-primary) !important;
    padding: 16px !important;
    text-align: left;
}

.swagger-ui table thead tr th {
    background: rgba(33, 38, 45, 0.8) !important;
    color: var(--text-primary) !important;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    position: sticky;
    top: 0;
    z-index: 10;
}

.swagger-ui a {
    color: var(--accent-blue) !important;
    transition: color 0.2s ease;
    text-decoration: none;
    &:focus {
        outline: 2px solid var(--accent-blue);
        outline-offset: 2px;
        border-radius: 4px;
    }
}

.swagger-ui a:hover {
    color: var(--accent-blue-bright) !important;
    text-decoration: underline;
    text-underline-offset: 3px;
}

.swagger-ui .opblock-tag {
    color: var(--text-primary) !important;
    border-bottom: 2px solid var(--border-secondary) !important;
    font-size: clamp(1.25rem, 3vw, 1.5rem) !important;
    font-weight: 700 !important;
    padding: 24px 0 !important;
    margin-bottom: 28px !important;
    position: relative;
    letter-spacing: -0.01em;
}

.swagger-ui .opblock-tag::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-blue), var(--accent-blue-bright));
    border-radius: 2px;
}

.swagger-ui .loading-container {
    background: var(--bg-overlay) !important;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    &::after {
        content: "";
        display: block;
        width: 40px;
        height: 40px;
        margin: 20px auto;
        border: 3px solid rgba(88, 166, 255, 0.3);
        border-top: 3px solid var(--accent-blue);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
}

.swagger-ui .error-wrapper {
    background: rgba(248, 81, 73, 0.1) !important;
    border: 1px solid rgba(248, 81, 73, 0.3) !important;
    border-radius: 16px;
    backdrop-filter: blur(8px);
    color: #ffa8a8;
    padding: 16px 20px;
}

.swagger-ui .success {
    background: rgba(73, 204, 144, 0.1) !important;
    border: 1px solid rgba(73, 204, 144, 0.3) !important;
    border-radius: 16px;
    color: #a8f5a8;
    padding: 16px 20px;
}

.swagger-ui .opblock-section-header {
    background: var(--background-secondary) !important;
    color: var(--text-primary) !important;
    font-weight: 600 !important;
    border-bottom: 1px solid var(--border-color) !important;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.swagger-ui .opblock {
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@media (prefers-color-scheme: dark) {
    .swagger-ui {
    }
}

@media (prefers-contrast: high) {
    :root {
        --border-primary: #ffffff;
        --text-secondary: #ffffff;
    }
}

@media (prefers-reduced-motion: reduce) {
    .swagger-ui * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

@media (max-width: 768px) {
    .swagger-ui .info .title {
        font-size: clamp(1.8rem, 6vw, 2.2rem);
    }

    .swagger-ui .opblock {
        margin-bottom: 16px;
        border-radius: 12px;
    }

    .swagger-ui .info {
        margin: 16px 0 24px 0;
        padding: 20px;
        border-radius: 16px;
    }

    .swagger-ui .btn.execute {
        padding: 12px 20px;
        font-size: 0.8rem;
        width: 100%;
    }

    .swagger-ui .opblock-summary {
        padding: 20px !important;
        min-height: 48px;
    }

    .swagger-ui .filter .operation-filter-input {
        padding: 16px 20px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .swagger-ui .info {
        padding: 16px;
        margin: 12px;
    }

    .swagger-ui .info .title {
        font-size: clamp(1.5rem, 8vw, 1.8rem);
    }

    .swagger-ui .opblock {
        border-radius: 12px;
        margin: 12px;
    }

    .swagger-ui .opblock-summary {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .swagger-ui .opblock-summary-method {
        align-self: flex-start;
    }
}

@media print {
    .swagger-ui {
        background: white !important;
        color: black !important;
        box-shadow: none !important;
    }

    .swagger-ui .opblock {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
        break-inside: avoid;
    }

    .swagger-ui .btn {
        display: none;
    }
}`

// src/function/password.ts
var import_node_crypto = require("node:crypto")
function HmacPassword(password) {
    return (0, import_node_crypto.createHmac)("sha512", process.env.HMAC_SECRET).update(password).digest("hex")
}

// src/function/utils.ts
function toTypeBox(arg) {
    if (!arg || typeof arg !== "object") return arg
    const result = {}
    for (const [key, value] of Object.entries(arg)) {
        if (value === null || value === void 0) {
            result[key] = null
        } else if (value instanceof Date) {
            result[key] = value.toISOString()
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) => (item instanceof Date ? item.toISOString() : item))
        } else if (typeof value === "object" && !(value instanceof Date)) {
            result[key] = toTypeBox(value)
        } else {
            result[key] = value
        }
    }
    return result
}

// src/function/validation.ts
function ValidationErrorHandler(errors, dataVar) {
    const path = typeof dataVar === "string" ? dataVar : "unknown"
    const errorsByPath = {}
    errors.forEach((error2) => {
        const instancePath = error2.instancePath ?? "root"
        if (!errorsByPath[instancePath]) {
            errorsByPath[instancePath] = []
        }
        errorsByPath[instancePath].push(error2)
    })
    const errorMessages = []
    Object.entries(errorsByPath).forEach(([instancePath, pathErrors]) => {
        const constErrors = pathErrors.filter((e) => e.keyword === "const")
        const otherErrors = pathErrors.filter((e) => e.keyword !== "const" && e.keyword !== "anyOf")
        if (constErrors.length > 0) {
            const allowedValues = constErrors.map((e) => e.params?.allowedValue).filter(Boolean)
            if (allowedValues.length > 0) {
                const fieldName = instancePath.replace("/", "") ?? "field"
                errorMessages.push(`${fieldName} must be one of: ${allowedValues.join(", ")}`)
            } else {
                errorMessages.push(
                    ...constErrors.map(
                        (e) => `${instancePath.replace("/", "") ?? "field"}: ${e.message ?? "Invalid value"}`
                    )
                )
            }
        }
        if (otherErrors.length > 0) {
            errorMessages.push(
                ...otherErrors.map((e) => {
                    const fieldName = instancePath.replace("/", "") ?? "field"
                    return `${fieldName}: ${e.message ?? "Invalid value"}`
                })
            )
        }
        if (constErrors.length === 0 && otherErrors.length === 0) {
            errorMessages.push(...pathErrors.map((e) => e.message ?? "Unknown error"))
        }
    })
    const finalMessage = errorMessages.length > 0 ? errorMessages.join("; ") : "Validation failed"
    return CreateError(400, "SCHEMA_VALIDATION_ERROR", `Schema validation failed for ${path}: ${finalMessage}`)
}

// ../../lib/schema/src/table/conversations.ts
var import_typebox = require("drizzle-orm/typebox")
var import_pg_core = require("drizzle-orm/pg-core")
var import_uuid = require("uuid")
var conversations = (0, import_pg_core.pgTable)("conversations", {
    id: (0, import_pg_core.uuid)("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => (0, import_uuid.v7)()),
    users: (0, import_pg_core.uuid)("users").array().notNull(),
    createdAt: (0, import_pg_core.timestamp)("created_at", { withTimezone: false })
        .notNull()
        .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: (0, import_pg_core.timestamp)("updated_at", { withTimezone: false })
        .notNull()
        .$onUpdateFn(() => /* @__PURE__ */ new Date())
})
var ConversationInsert = (0, import_typebox.createInsertSchema)(conversations)
var ConversationSelect = (0, import_typebox.createSelectSchema)(conversations)
var ConversationUpdate = (0, import_typebox.createUpdateSchema)(conversations)

// ../../lib/schema/src/table/messages.ts
var import_typebox3 = require("drizzle-orm/typebox")
var import_pg_core3 = require("drizzle-orm/pg-core")

// ../../lib/schema/src/table/users.ts
var import_typebox2 = require("drizzle-orm/typebox")
var import_pg_core2 = require("drizzle-orm/pg-core")
var import_drizzle_orm = require("drizzle-orm")
var import_uuid2 = require("uuid")
var Gender = (0, import_pg_core2.pgEnum)("gender", ["male", "female", "other"])
var users = (0, import_pg_core2.pgTable)(
    "users",
    {
        id: (0, import_pg_core2.uuid)("id")
            .primaryKey()
            .$defaultFn(() => (0, import_uuid2.v7)()),
        email: (0, import_pg_core2.text)("email").notNull().unique(),
        name: (0, import_pg_core2.text)("name").notNull(),
        username: (0, import_pg_core2.text)("username").unique().notNull(),
        gender: Gender("gender").notNull(),
        avatar: (0, import_pg_core2.text)("avatar"),
        password: (0, import_pg_core2.char)("password", { length: 128 }).notNull(),
        ban: (0, import_pg_core2.text)("ban"),
        createdAt: (0, import_pg_core2.timestamp)("created_at", { withTimezone: false })
            .notNull()
            .$defaultFn(() => /* @__PURE__ */ new Date()),
        updatedAt: (0, import_pg_core2.timestamp)("updated_at", { withTimezone: false })
            .notNull()
            .$onUpdateFn(() => /* @__PURE__ */ new Date())
    },
    (table4) => [
        (0, import_pg_core2.check)("password_length_check", import_drizzle_orm.sql`length(${table4.password}) = 128`),
        (0, import_pg_core2.check)(
            "username_format_check",
            import_drizzle_orm.sql`${table4.username} ~ '^[a-zA-Z][a-zA-Z0-9-]{2,11}$'`
        ),
        (0, import_pg_core2.check)(
            "email_format_check",
            import_drizzle_orm.sql`${table4.email} ~ '^[^@]+@[^@]+\.[^@]+$'`
        )
    ]
)
var UserInsert = (0, import_typebox2.createInsertSchema)(users)
var UserSelect = (0, import_typebox2.createSelectSchema)(users)
var UserUpdate = (0, import_typebox2.createUpdateSchema)(users)

// ../../lib/schema/src/table/messages.ts
var import_uuid3 = require("uuid")
var status = (0, import_pg_core3.pgEnum)("status", ["sent", "delivered", "read", "edited", "deleted"])
var messages = (0, import_pg_core3.pgTable)("messages", {
    id: (0, import_pg_core3.uuid)("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => (0, import_uuid3.v7)()),
    content: (0, import_pg_core3.text)("content").notNull(),
    sender: (0, import_pg_core3.uuid)("sender")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    conversation: (0, import_pg_core3.uuid)("conversation")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    status: status("status").array().notNull().default(["sent"]),
    createdAt: (0, import_pg_core3.timestamp)("created_at", { withTimezone: false })
        .notNull()
        .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: (0, import_pg_core3.timestamp)("updated_at", { withTimezone: false })
        .notNull()
        .$onUpdateFn(() => /* @__PURE__ */ new Date())
})
var MessageInsert = (0, import_typebox3.createInsertSchema)(messages)
var MessageSelect = (0, import_typebox3.createSelectSchema)(messages)
var MessageUpdate = (0, import_typebox3.createUpdateSchema)(messages)

// ../../lib/schema/src/types/utility.ts
var import_typebox4 = require("typebox")
var import_uuid4 = require("uuid")
var Nullable = (schema, options) => {
    return import_typebox4.Type.Union([schema, import_typebox4.Type.Null()], options)
}
var UUID = import_typebox4.Type.String({
    examples: [(0, import_uuid4.v7)()],
    pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
})
var Date2 = import_typebox4.Type.String({ format: "date-time" })

// ../../lib/schema/src/types/conversations.ts
var import_typebox5 = __toESM(require("typebox"))
var Conversation = import_typebox5.default.Object({
    id: UUID,
    participant: UUID,
    createdAt: Date2,
    updatedAt: Date2
})

// ../../lib/schema/src/types/messages.ts
var import_typebox6 = __toESM(require("typebox"))
var MessageContent = import_typebox6.default.String({ minLength: 1, maxLength: 2e3 })
var Message = import_typebox6.default.Object({
    id: UUID,
    content: MessageContent,
    sender: UUID,
    conversation: UUID,
    status: MessageSelect.properties.status,
    createdAt: Date2,
    updatedAt: Date2
})

// ../../lib/schema/src/types/response.ts
var import_typebox7 = require("typebox")
var Payload = import_typebox7.Type.Object({
    id: UUID,
    iat: import_typebox7.Type.Number(),
    exp: import_typebox7.Type.Number()
})
function ErrorResponse(code, description) {
    return import_typebox7.Type.Object(
        {
            statusCode: import_typebox7.Type.Integer({
                examples: [code],
                description: "HTTP status code of the error"
            }),
            error: import_typebox7.Type.String({ description: "Error type or category" }),
            message: import_typebox7.Type.String({ description: "Human-readable error message" })
        },
        {
            $id: "ErrorResponse",
            description: description ?? "Standard error response format for API endpoints"
        }
    )
}

// ../../lib/schema/src/types/user.ts
var import_typebox8 = __toESM(require("typebox"))
var RegisterUser = import_typebox8.default.Object({
    email: import_typebox8.default.String({ format: "email" }),
    name: UserSelect.properties.name,
    username: import_typebox8.default.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    gender: UserSelect.properties.gender,
    avatar: import_typebox8.default.Optional(import_typebox8.default.String({ format: "url" })),
    password: import_typebox8.default.String({ minLength: 6, maxLength: 30 })
})
var LoginUser = import_typebox8.default.Object({
    input: import_typebox8.default.String(),
    password: import_typebox8.default.String()
})
var ChangeUserEmail = import_typebox8.default.Object({
    email: import_typebox8.default.String({ format: "email" }),
    password: import_typebox8.default.String()
})
var ChangeUserPassword = import_typebox8.default.Object({
    oldPassword: import_typebox8.default.String(),
    newPassword: import_typebox8.default.String({ minLength: 6, maxLength: 30 })
})
var PublicUser = import_typebox8.default.Object({
    id: UUID,
    name: UserSelect.properties.name,
    username: import_typebox8.default.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    avatar: Nullable(import_typebox8.default.String({ format: "url" })),
    gender: UserSelect.properties.gender,
    createdAt: Date2
})
var AuthenticatedUser = import_typebox8.default.Interface(
    [import_typebox8.default.Omit(UserSelect, ["ban", "password", "createdAt", "updatedAt"])],
    { createdAt: Date2, updatedAt: Date2 }
)
var ChangeUserInfo = import_typebox8.default.Partial(
    import_typebox8.default.Pick(AuthenticatedUser, ["name", "username", "gender", "avatar"])
)

// src/decorate/auth.ts
var import_value = __toESM(require("typebox/value"))
var import_assert = require("assert")
async function auth(fastify) {
    fastify.decorate("auth", async function (request, reply2) {
        try {
            const user = await request.jwtVerify()
            if (!import_value.default.Check(Payload, user)) {
                reply2.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(401, "INVALID_TOKEN_PAYLOAD", "Invalid authentication token structure")
            }
            request.payload = user
        } catch (error2) {
            if (isFastifyError(error2) || import_assert.AssertionError.isError(error2)) {
                reply2.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(401, "AUTHENTICATION_FAILED", "Authentication failed")
            } else {
                console.trace(error2)
                reply2.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
            }
        }
    })
}

// src/decorate/index.ts
async function Decorate(fastify) {
    await auth(fastify)
}

// src/routes/conversation/create-conversation.ts
var import_drizzle_orm2 = require("drizzle-orm")

// src/database/index.ts
var import_postgres_js = require("drizzle-orm/postgres-js")
var import_postgres = __toESM(require("postgres"))
var db = (0, import_postgres_js.drizzle)({ client: (0, import_postgres.default)(process.env.DATABASE_URI) })
var table = {
    conversations,
    messages,
    users
}

// src/routes/conversation/create-conversation.ts
var import_typebox9 = require("typebox")
function CreateConversation(fastify) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id",
        schema: {
            description: "Create new conversation with another user",
            tags: ["Conversations"],
            params: import_typebox9.Type.Object({ id: UUID }),
            response: {
                201: Conversation,
                400: ErrorResponse(400, "Bad request - invalid user id or conversation already exists"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id: otherUserId } = request.params
                const user = request.payload
                if (user.id === otherUserId) {
                    throw CreateError(400, "INVALID_REQUEST", "Cannot create conversation with yourself")
                }
                const [otherUser] = await db
                    .select({ id: table.users.id })
                    .from(table.users)
                    .where((0, import_drizzle_orm2.eq)(table.users.id, otherUserId))
                if (!otherUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }
                const existingConversation = await db
                    .select()
                    .from(table.conversations)
                    .where((0, import_drizzle_orm2.arrayContains)(table.conversations.users, [user.id, otherUser.id]))
                if (existingConversation.length > 0) {
                    throw CreateError(400, "CONVERSATION_EXISTS", "Conversation already exists between these users")
                }
                const [conversation] = await db
                    .insert(table.conversations)
                    .values({ users: [user.id, otherUser.id] })
                    .returning()
                if (!conversation) {
                    throw CreateError(500, "CREATION_FAILED", "Failed to create conversation")
                }
                const participant = conversation.users.filter((id) => id !== user.id).shift() ?? ""
                return reply2.status(201).send(toTypeBox({ participant, ...conversation }))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/conversation/delete-conversation.ts
var import_drizzle_orm3 = require("drizzle-orm")
var import_typebox10 = require("typebox")
function DeleteConversation(fastify) {
    fastify.route({
        method: "DELETE",
        url: "/conversations/:id",
        schema: {
            description: "Delete a conversation",
            tags: ["Conversations"],
            params: import_typebox10.Type.Object({ id: UUID }),
            response: {
                200: import_typebox10.Type.Object({ success: import_typebox10.Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not authorized to delete this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.params
                const user = request.payload
                const [existingConversation] = await db
                    .select()
                    .from(table.conversations)
                    .where(
                        (0, import_drizzle_orm3.and)(
                            (0, import_drizzle_orm3.eq)(table.conversations.id, id),
                            (0, import_drizzle_orm3.arrayContains)(table.conversations.users, [user.id])
                        )
                    )
                if (!existingConversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }
                const [deletedRows] = await db
                    .delete(table.conversations)
                    .where((0, import_drizzle_orm3.eq)(table.conversations.id, id))
                    .returning()
                if (!deletedRows) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }
                return reply2.status(200).send({ success: true })
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/conversation/get-conversation-by-id.ts
var import_drizzle_orm4 = require("drizzle-orm")
var import_typebox11 = require("typebox")
function GetConversationId(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id",
        schema: {
            description: "Get specific conversation details",
            tags: ["Conversations"],
            params: import_typebox11.Type.Object({ id: UUID }),
            querystring: import_typebox11.Type.Partial(
                import_typebox11.Type.Object({ type: import_typebox11.Type.String() })
            ),
            response: {
                200: Conversation,
                400: ErrorResponse(400, "Bad request - Invalid conversation type"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not a participant in this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { type } = request.query
                const { id } = request.params
                const user = request.payload
                const conditions = []
                switch (type) {
                    case "conversation": {
                        conditions.push(
                            (0, import_drizzle_orm4.eq)(table.conversations.id, id),
                            (0, import_drizzle_orm4.arrayContains)(table.conversations.users, [user.id])
                        )
                        break
                    }
                    case "user": {
                        conditions.push(
                            (0, import_drizzle_orm4.arrayContains)(table.conversations.users, [user.id, id])
                        )
                        break
                    }
                    default: {
                        throw CreateError(400, "INVALID_CONVERSATION_TYPE", "Invalid conversation type")
                    }
                }
                const [conversation] = await db
                    .select()
                    .from(table.conversations)
                    .where((0, import_drizzle_orm4.and)(...conditions))
                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }
                const participant = conversation.users.filter((id2) => id2 !== user.id).shift() ?? ""
                return reply2.status(200).send(toTypeBox({ participant, ...conversation }))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/conversation/get-conversations.ts
var import_drizzle_orm5 = require("drizzle-orm")
var import_typebox12 = require("typebox")
function GetConversation(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations",
        schema: {
            description: "Get user's conversations list",
            tags: ["Conversations"],
            querystring: import_typebox12.Type.Object({
                page: import_typebox12.Type.Optional(import_typebox12.Type.Number({ minimum: 1, default: 1 })),
                limit: import_typebox12.Type.Optional(
                    import_typebox12.Type.Number({ minimum: 1, maximum: 100, default: 20 })
                )
            }),
            response: {
                200: import_typebox12.Type.Array(Conversation, { maxItems: 100, minItems: 0 }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { page = 1, limit = 20 } = request.query
                const user = request.payload
                if (!user) {
                    throw CreateError(401, "UNAUTHORIZED", "User authentication required")
                }
                const offset = (page - 1) * limit
                const conversations2 = await db
                    .select()
                    .from(table.conversations)
                    .where((0, import_drizzle_orm5.arrayContains)(table.conversations.users, [user.id]))
                    .orderBy((0, import_drizzle_orm5.desc)(table.conversations.updatedAt))
                    .limit(limit)
                    .offset(offset)
                return reply2.status(200).send(
                    conversations2.map((x) => {
                        const participant = x.users.filter((id) => id !== user.id).shift() ?? ""
                        return toTypeBox({ participant, ...x })
                    })
                )
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/conversation/index.ts
function Conversation2(fastify) {
    CreateConversation(fastify)
    DeleteConversation(fastify)
    GetConversationId(fastify)
    GetConversation(fastify)
}

// src/routes/message/delete-message.ts
var import_drizzle_orm6 = require("drizzle-orm")
var import_typebox13 = require("typebox")
function DeleteMessage(fastify) {
    fastify.route({
        method: "DELETE",
        url: "/messages/:id",
        schema: {
            description: "Delete a message",
            tags: ["Messages"],
            params: import_typebox13.Type.Object({ id: UUID }),
            response: {
                200: import_typebox13.Type.Object({ success: import_typebox13.Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id: msgId } = request.params
                const { id: userId } = request.payload
                const [{ messages: messages2, conversations: conversations2 }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(
                        table.conversations,
                        (0, import_drizzle_orm6.eq)(table.conversations.id, table.messages.conversation)
                    )
                    .where(
                        (0, import_drizzle_orm6.and)(
                            (0, import_drizzle_orm6.eq)(table.messages.id, msgId),
                            (0, import_drizzle_orm6.eq)(table.messages.sender, userId)
                        )
                    )
                if (
                    !messages2 ||
                    !conversations2 ||
                    messages2.sender !== userId ||
                    messages2.status.includes("deleted")
                ) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }
                await db
                    .update(table.messages)
                    .set({ status: [...messages2.status, "deleted"] })
                    .where(
                        (0, import_drizzle_orm6.and)(
                            (0, import_drizzle_orm6.eq)(table.messages.id, msgId),
                            (0, import_drizzle_orm6.eq)(table.messages.sender, userId)
                        )
                    )
                if (fastify.io) {
                    const toSend = conversations2.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_deleted", msgId, conversations2.id)
                }
                return reply2.code(200).send({ success: true })
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/message/edit-message.ts
var import_drizzle_orm7 = require("drizzle-orm")
var import_typebox14 = require("typebox")
function EditMessage(fastify) {
    fastify.route({
        method: "PATCH",
        url: "/messages/:id",
        schema: {
            description: "Edit a message",
            tags: ["Messages"],
            params: import_typebox14.Type.Object({ id: UUID }),
            body: import_typebox14.Type.Object({ content: MessageContent }),
            response: {
                200: Message,
                400: ErrorResponse(400, "Bad request - invalid content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.params
                const { content } = request.body
                const user = request.payload
                const [{ messages: messages2, conversations: conversations2 }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(
                        table.conversations,
                        (0, import_drizzle_orm7.eq)(table.conversations.id, table.messages.conversation)
                    )
                    .where((0, import_drizzle_orm7.eq)(table.messages.id, id))
                if (
                    !messages2 ||
                    !conversations2 ||
                    messages2.sender !== user.id ||
                    messages2.status.includes("deleted")
                ) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }
                if (messages2.content === content.trim()) {
                    throw CreateError(400, "NO_CONTENT_CHANGE", "New content is the same as the current content")
                }
                const [updatedMessage] = await db
                    .update(table.messages)
                    .set({ content: content.trim() })
                    .where(
                        (0, import_drizzle_orm7.and)(
                            (0, import_drizzle_orm7.eq)(table.messages.id, id),
                            (0, import_drizzle_orm7.eq)(table.messages.sender, user.id)
                        )
                    )
                    .returning()
                if (fastify.io) {
                    const toSend = conversations2.users.filter((x) => x !== user.id)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), conversations2.id)
                }
                return reply2.code(200).send(toTypeBox(updatedMessage))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/message/get-message.ts
var import_drizzle_orm8 = require("drizzle-orm")
var import_typebox15 = require("typebox")
function GetMessages(fastify) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id/messages",
        schema: {
            description: "Get messages in a conversation",
            tags: ["Messages"],
            params: import_typebox15.Type.Object({ id: UUID }),
            querystring: import_typebox15.Type.Object({
                page: import_typebox15.Type.Optional(import_typebox15.Type.Number({ minimum: 1, default: 1 })),
                limit: import_typebox15.Type.Optional(
                    import_typebox15.Type.Number({ minimum: 1, maximum: 100, default: 50 })
                ),
                before: import_typebox15.Type.Optional(import_typebox15.Type.String({ format: "date-time" })),
                after: import_typebox15.Type.Optional(import_typebox15.Type.String({ format: "date-time" }))
            }),
            response: {
                200: import_typebox15.Type.Array(Message, { maxItems: 100, minItems: 0 }),
                400: ErrorResponse(400, "Bad request - invalid query parameters"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id: userId } = request.payload
                const { id: conversationId } = request.params
                const { page = 1, limit = 50, before, after } = request.query
                const [conversation] = await db
                    .select()
                    .from(table.conversations)
                    .where(
                        (0, import_drizzle_orm8.and)(
                            (0, import_drizzle_orm8.eq)(table.conversations.id, conversationId),
                            (0, import_drizzle_orm8.arrayContains)(table.conversations.users, [userId])
                        )
                    )
                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }
                const whereConditions = [
                    (0, import_drizzle_orm8.eq)(table.messages.conversation, conversation.id),
                    (0, import_drizzle_orm8.not)(
                        (0, import_drizzle_orm8.arrayContains)(table.messages.status, ["deleted"])
                    )
                ]
                if (before) {
                    const beforeDate = new Date(before)
                    if (isNaN(beforeDate.getTime())) {
                        throw CreateError(400, "INVALID_TIMESTAMP", "Invalid 'before' timestamp format")
                    }
                    whereConditions.push((0, import_drizzle_orm8.lt)(table.messages.createdAt, beforeDate))
                }
                if (after) {
                    const afterDate = new Date(after)
                    if (isNaN(afterDate.getTime())) {
                        throw CreateError(400, "INVALID_TIMESTAMP", "Invalid 'after' timestamp format")
                    }
                    whereConditions.push((0, import_drizzle_orm8.gt)(table.messages.createdAt, afterDate))
                }
                const offset = (page - 1) * limit
                const messages2 = await db
                    .select()
                    .from(table.messages)
                    .where((0, import_drizzle_orm8.and)(...whereConditions))
                    .orderBy((0, import_drizzle_orm8.asc)(table.messages.id))
                    .limit(limit)
                    .offset(offset)
                return reply2.code(200).send(messages2.map((x) => toTypeBox(x)))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/message/read-message.ts
var import_drizzle_orm9 = require("drizzle-orm")
var import_typebox16 = require("typebox")
function ReadMessage(fastify) {
    fastify.route({
        method: "PUT",
        url: "/messages/:id/read",
        schema: {
            description: "Mark a message as read",
            tags: ["Messages"],
            params: import_typebox16.Type.Object({ id: UUID }),
            response: {
                200: import_typebox16.Type.Object({ success: import_typebox16.Type.Boolean() }),
                400: ErrorResponse(400, "Bad request - message cannot be marked as read"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.params
                const { id: userId } = request.payload
                const [{ messages: messages2, conversations: conversations2 }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(
                        table.conversations,
                        (0, import_drizzle_orm9.eq)(table.conversations.id, table.messages.conversation)
                    )
                    .where(
                        (0, import_drizzle_orm9.and)(
                            (0, import_drizzle_orm9.eq)(table.messages.id, id),
                            (0, import_drizzle_orm9.arrayContains)(table.conversations.users, [userId])
                        )
                    )
                if (!messages2 || !conversations2 || messages2.status.includes("deleted")) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }
                if (messages2.status.includes("read")) {
                    throw CreateError(400, "MESSAGE_ALREADY_READ", "Message is already marked as read")
                }
                if (messages2.sender === userId) {
                    throw CreateError(400, "CANNOT_MARK_OWN_MESSAGE", "Cannot mark your own message as read")
                }
                const [updatedMessage] = await db
                    .update(table.messages)
                    .set({ status: [...messages2.status, "read"], updatedAt: messages2.updatedAt })
                    .where((0, import_drizzle_orm9.eq)(table.messages.id, id))
                    .returning()
                if (fastify.io) {
                    const toSend = conversations2.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), updatedMessage.conversation)
                }
                return reply2.code(200).send({ success: true })
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/message/send-message.ts
var import_drizzle_orm10 = require("drizzle-orm")
var import_typebox17 = require("typebox")
function SendMessage(fastify) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id/messages",
        schema: {
            description: "Send a new message to a conversation",
            tags: ["Messages"],
            params: import_typebox17.Type.Object({ id: UUID }),
            body: import_typebox17.Type.Object({ content: MessageContent }),
            response: {
                201: Message,
                400: ErrorResponse(400, "Bad request - invalid message content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - conversation not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id: conversationId } = request.params
                const { id: userId } = request.payload
                const { content } = request.body
                const trimmedContent = content.trim()
                if (!trimmedContent) {
                    throw CreateError(400, "INVALID_CONTENT", "Message content cannot be empty")
                }
                const [conversations2] = await db
                    .select()
                    .from(table.conversations)
                    .where(
                        (0, import_drizzle_orm10.and)(
                            (0, import_drizzle_orm10.eq)(table.conversations.id, conversationId),
                            (0, import_drizzle_orm10.arrayContains)(table.conversations.users, [userId])
                        )
                    )
                if (!conversations2) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }
                const [message2] = await db
                    .insert(table.messages)
                    .values({ content: trimmedContent, sender: userId, conversation: conversations2.id })
                    .returning()
                await db
                    .update(table.conversations)
                    .set({ updatedAt: /* @__PURE__ */ new Date() })
                    .where((0, import_drizzle_orm10.eq)(table.conversations.id, conversationId))
                if (fastify.io) {
                    const toSend = conversations2.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_created", toTypeBox(message2), conversations2.id)
                }
                return reply2.code(201).send(toTypeBox(message2))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/message/index.ts
function Message2(fastify) {
    DeleteMessage(fastify)
    EditMessage(fastify)
    GetMessages(fastify)
    ReadMessage(fastify)
    SendMessage(fastify)
}

// src/routes/user/get-user-by-id.ts
var import_typebox18 = require("typebox")
var import_drizzle_orm11 = require("drizzle-orm")
function GetUserByID(fastify) {
    fastify.route({
        method: "GET",
        url: "/users/:id",
        schema: {
            description: "Get specific user profile",
            tags: ["Users"],
            params: import_typebox18.Type.Object({ id: UUID }),
            response: {
                200: PublicUser,
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.params
                const [user] = await db
                    .select()
                    .from(table.users)
                    .where((0, import_drizzle_orm11.eq)(table.users.id, id))
                if (!user) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                return reply2.status(200).send(toTypeBox(user))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/user/get-users.ts
var import_drizzle_orm12 = require("drizzle-orm")
var import_typebox19 = require("typebox")
function GetUsers(fastify) {
    fastify.route({
        method: "POST",
        url: "/users",
        schema: {
            description: "Get list of all users",
            tags: ["Users"],
            querystring: import_typebox19.Type.Partial(
                import_typebox19.Type.Object({
                    page: import_typebox19.Type.Integer({ default: 1, minimum: 1 }),
                    limit: import_typebox19.Type.Integer({ maximum: 100, minimum: 1 }),
                    search: import_typebox19.Type.String()
                })
            ),
            body: Nullable(import_typebox19.Type.Array(UUID, { maxItems: 100, minItems: 0 })),
            response: {
                200: import_typebox19.Type.Array(PublicUser, { maxItems: 100, minItems: 0 }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        config: {
            rateLimit: {
                max: 100,
                timeWindow: "1 minute"
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { page = 1, limit = 20, search } = request.query
                const id = request.body
                const conditions = []
                if (id && id.length) {
                    conditions.push(
                        (0, import_drizzle_orm12.or)(...id.map((x) => (0, import_drizzle_orm12.eq)(table.users.id, x)))
                    )
                }
                if (search) {
                    const il1 = (0, import_drizzle_orm12.ilike)(table.users.username, `%${search}%`)
                    const il2 = (0, import_drizzle_orm12.ilike)(table.users.name, `%${search}%`)
                    conditions.push((0, import_drizzle_orm12.or)(il1, il2))
                }
                const whereClause = conditions.length > 0 ? (0, import_drizzle_orm12.and)(...conditions) : void 0
                const offset = (page - 1) * limit
                const user = await db
                    .select()
                    .from(table.users)
                    .where(whereClause)
                    .orderBy((0, import_drizzle_orm12.desc)(table.users.createdAt))
                    .limit(limit)
                    .offset(offset)
                return reply2.status(200).send(user.map((x) => toTypeBox(x)))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/user/index.ts
function User(fastify) {
    GetUsers(fastify)
    GetUserByID(fastify)
}

// src/routes/auth/change-password.ts
var import_node_crypto2 = require("node:crypto")
var import_drizzle_orm13 = require("drizzle-orm")
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
                403: ErrorResponse(403, "Forbidden - Incorrect password or user is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { oldPassword, newPassword } = request.body
                const { id } = request.payload
                const [oldUser] = await db
                    .select()
                    .from(table.users)
                    .where((0, import_drizzle_orm13.eq)(table.users.id, id))
                if (!oldUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }
                if (oldUser.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                }
                if (
                    !(0, import_node_crypto2.timingSafeEqual)(
                        Buffer.from(oldUser.password),
                        Buffer.from(HmacPassword(oldPassword))
                    )
                ) {
                    throw CreateError(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                }
                const [newUser] = await db
                    .update(table.users)
                    .set({ password: HmacPassword(newPassword) })
                    .where((0, import_drizzle_orm13.eq)(table.users.id, id))
                    .returning()
                return reply2.status(200).send(toTypeBox(newUser))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/change-email.ts
var import_node_crypto3 = require("node:crypto")
var import_drizzle_orm14 = require("drizzle-orm")
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
                403: ErrorResponse(403, "Forbidden - Incorrect password or user is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { email, password } = request.body
                const { id } = request.payload
                const [oldUser] = await db
                    .select()
                    .from(table.users)
                    .where((0, import_drizzle_orm14.eq)(table.users.id, id))
                if (!oldUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }
                if (oldUser.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                }
                if (
                    !(0, import_node_crypto3.timingSafeEqual)(
                        Buffer.from(oldUser.password),
                        Buffer.from(HmacPassword(password))
                    )
                ) {
                    throw CreateError(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                }
                const [newUser] = await db
                    .update(table.users)
                    .set({ email })
                    .where((0, import_drizzle_orm14.eq)(table.users.id, id))
                    .returning()
                return reply2.status(200).send(toTypeBox(newUser))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/update-user.ts
var import_drizzle_orm15 = require("drizzle-orm")
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
                403: ErrorResponse(403, "Forbidden - User is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.payload
                const data = request.body
                if (!data.avatar) data.avatar = null
                const [oldUser] = await db
                    .select()
                    .from(table.users)
                    .where((0, import_drizzle_orm15.eq)(table.users.id, id))
                if (!oldUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }
                if (oldUser.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                }
                const [newUser] = await db
                    .update(table.users)
                    .set(data)
                    .where((0, import_drizzle_orm15.eq)(table.users.id, id))
                    .returning()
                return reply2.status(200).send(toTypeBox(newUser))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/register.ts
var import_drizzle_orm16 = require("drizzle-orm")
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
                400: ErrorResponse(400, "Bad Request - Invalid input data"),
                409: ErrorResponse(409, "Conflict - Email or username already exists"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        handler: async (request, reply2) => {
            const { email, username, password } = request.body
            try {
                const [exist] = await db
                    .select({ email: table.users.email, username: table.users.username })
                    .from(table.users)
                    .where(
                        (0, import_drizzle_orm16.or)(
                            (0, import_drizzle_orm16.eq)(table.users.email, email),
                            (0, import_drizzle_orm16.eq)(table.users.username, username)
                        )
                    )
                if (exist) {
                    if (exist.email === email) {
                        throw CreateError(409, "EMAIL_ALREADY_EXISTS", "This email is already registered")
                    }
                    if (exist.username === username) {
                        throw CreateError(409, "USERNAME_ALREADY_EXISTS", "This username is already taken")
                    }
                }
                const [user] = await db
                    .insert(table.users)
                    .values({ ...request.body, password: HmacPassword(password) })
                    .returning()
                if (!user) {
                    throw CreateError(500, "USER_CREATION_FAILED", "Failed to create user account")
                }
                const exp = 86400
                const payload = {
                    id: user.id,
                    iat: Math.floor(Date.now() / 1e3),
                    exp: Math.floor(Date.now() / 1e3) + exp
                }
                const jwt2 = fastify.jwt.sign(payload)
                reply2.setCookie("auth", jwt2, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: exp,
                    path: "/"
                })
                return reply2.status(201).send(toTypeBox(user))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/logout.ts
var import_typebox20 = require("typebox")
function Logout(fastify) {
    fastify.route({
        method: "POST",
        url: "/auth/logout",
        schema: {
            description: "Logout user and clear authentication",
            tags: ["Authentication"],
            response: {
                200: import_typebox20.Type.Object({ success: import_typebox20.Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (_, reply2) => {
            try {
                reply2.clearCookie("auth", {
                    path: "/",
                    signed: true,
                    sameSite: "strict"
                })
                return reply2.send({
                    success: true,
                    message: "Successfully logged out"
                })
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/login.ts
var import_node_crypto4 = require("node:crypto")
var import_drizzle_orm17 = require("drizzle-orm")
function Login(fastify) {
    fastify.route({
        method: "POST",
        url: "/auth/login",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: LoginUser,
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse(403, "Forbidden - Incorrect username/email or password or user is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        handler: async (request, reply2) => {
            try {
                const { input, password } = request.body
                const [user] = await db
                    .select()
                    .from(table.users)
                    .where(
                        (0, import_drizzle_orm17.or)(
                            (0, import_drizzle_orm17.eq)(table.users.email, input),
                            (0, import_drizzle_orm17.eq)(table.users.username, input)
                        )
                    )
                if (!user) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }
                if (user.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${user.ban} Contact support for more information.`
                    )
                }
                if (
                    !(0, import_node_crypto4.timingSafeEqual)(
                        Buffer.from(user.password),
                        Buffer.from(HmacPassword(password))
                    )
                ) {
                    throw CreateError(403, "INCORRECT_INPUTTED_DATA", "Incorrect username/email or password")
                }
                const exp = 86400
                const payload = {
                    id: user.id,
                    iat: Math.floor(Date.now() / 1e3),
                    exp: Math.floor(Date.now() / 1e3) + exp
                }
                const jwt2 = fastify.jwt.sign(payload)
                reply2.setCookie("auth", jwt2, {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: exp,
                    path: "/"
                })
                return reply2.status(200).send(toTypeBox(user))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/me.ts
var import_drizzle_orm18 = require("drizzle-orm")
function Login2(fastify) {
    fastify.route({
        method: "GET",
        url: "/auth/me",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse(403, "Forbidden - User is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply2) => {
            try {
                const { id } = request.payload
                const [user] = await db
                    .select()
                    .from(table.users)
                    .where((0, import_drizzle_orm18.eq)(table.users.id, id))
                if (user.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${user.ban} Contact support for more information.`
                    )
                }
                if (!user) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                return reply2.status(200).send(toTypeBox(user))
            } catch (error2) {
                await xcf(error2)
            }
        }
    })
}

// src/routes/auth/index.ts
function Auth(fastify) {
    ChangePassword(fastify)
    ChangeEmail(fastify)
    UpdateUser(fastify)
    Register(fastify)
    Logout(fastify)
    Login(fastify)
    Login2(fastify)
}

// src/routes/index.ts
function Routes(fastify) {
    fastify.get("/status", { logLevel: "silent", config: { rateLimit: false } }, (_, reply2) => reply2.send("OK"))
    fastify.get("/license", () => `Search it up, it's MIT`)
    fastify.get("/terms", () => "ToS?? Forget about it")
    Conversation2(fastify)
    Message2(fastify)
    User(fastify)
    Auth(fastify)
}

// src/plugin/swagger-ui.ts
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"))
async function swagger_ui(fastify) {
    await fastify.register(import_swagger_ui.default, {
        routePrefix: "/",
        staticCSP: true,
        transformSpecificationClone: true,
        uiConfig: {
            defaultModelRendering: "example",
            docExpansion: "list",
            displayRequestDuration: true,
            showCommonExtensions: false,
            displayOperationId: false,
            tryItOutEnabled: false,
            showExtensions: false,
            deepLinking: false,
            filter: true,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            supportedSubmitMethods: []
        },
        theme: {
            title: "API Documentation",
            css: [
                {
                    filename: "custom.css",
                    content: SCSS
                }
            ]
        }
    })
}

// src/plugin/socket-io.ts
var import_fastify_socket = __toESM(require("fastify-socket.io"))
async function socket(fastify) {
    await fastify.register(import_fastify_socket.default, {
        cookie: true,
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:7700",
            credentials: true
        }
    })
}

// src/plugin/swagger.ts
var import_swagger = __toESM(require("@fastify/swagger"))

// package.json
var version = "0.0.1"

// src/plugin/swagger.ts
async function swagger(fastify) {
    await fastify.register(import_swagger.default, {
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

// src/plugin/cookie.ts
var import_cookie = __toESM(require("@fastify/cookie"))
async function cookie(fastify) {
    await fastify.register(import_cookie.default, { secret: process.env.COOKIE_SECRET })
}

// src/plugin/rate-limit.ts
var import_rate_limit = __toESM(require("@fastify/rate-limit"))
async function rl(fastify) {
    await fastify.register(import_rate_limit.default, {
        max: 10,
        timeWindow: 2e4,
        allowList: ["127.0.0.1"],
        keyGenerator: (req) => {
            const forwarded = req.headers["x-forwarded-for"]
            return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip
        }
    })
}

// src/plugin/cors.ts
var import_cors = __toESM(require("@fastify/cors"))
async function cors(fastify) {
    await fastify.register(import_cors.default, {
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        origin: (origin, cb) => cb(null, true)
    })
}

// src/plugin/jwt.ts
var import_jwt = __toESM(require("@fastify/jwt"))
async function jwt(fastify) {
    await fastify.register(import_jwt.default, {
        cookie: { cookieName: "auth", signed: true },
        secret: process.env.COOKIE_SECRET
    })
}

// src/plugin/index.ts
async function Plugin(fastify) {
    if (process.env.NODE_ENV === "development") {
        await swagger(fastify)
        await swagger_ui(fastify)
    }
    await rl(fastify)
    await socket(fastify)
    await cookie(fastify)
    await jwt(fastify)
    await cors(fastify)
}

// src/socket/index.ts
var import_drizzle_orm21 = require("drizzle-orm")

// src/socket/user-status.ts
var import_drizzle_orm19 = require("drizzle-orm")
async function UserStatusChanged(socket2) {
    try {
        const { user } = socket2
        const conversations2 = await db
            .select()
            .from(table.conversations)
            .where((0, import_drizzle_orm19.arrayContains)(table.conversations.users, [user.id]))
        const relatedUserIds = Array.from(
            new Set(conversations2.map((x) => x.users.filter((c) => c !== user.id).shift() ?? ""))
        )
        for (const userId of relatedUserIds) {
            socket2.to(userId).emit("user_status_changed", user.id, "online")
            if ((await socket2.in(userId).fetchSockets()).length > 0) {
                socket2.emit("user_status_changed", userId, "online")
            }
        }
        socket2.on("disconnect", () => {
            for (const userId of relatedUserIds) {
                socket2.to(userId).emit("user_status_changed", user.id, "offline")
            }
        })
    } catch (error2) {
        console.error(error2)
        socket2.emit("errors", "Internal Server Error")
    }
}

// src/socket/typing.ts
var import_drizzle_orm20 = require("drizzle-orm")
async function TypingStatusChanged(socket2) {
    socket2.on("typing", async (conversationId, status2) => {
        try {
            const { user } = socket2
            const [conversation] = await db
                .select()
                .from(table.conversations)
                .where(
                    (0, import_drizzle_orm20.and)(
                        (0, import_drizzle_orm20.eq)(table.conversations.id, conversationId),
                        (0, import_drizzle_orm20.arrayContains)(table.conversations.users, [user.id])
                    )
                )
            if (!conversation) return socket2.emit("errors", "Conversation not found")
            const toSend = conversation.users.filter((x) => x !== user.id)
            socket2.to(toSend).emit("typing", user.id, conversation.id, status2)
        } catch (error2) {
            console.error(error2)
            socket2.emit("errors", "Internal Server Error")
        }
    })
}

// src/socket/index.ts
var socket_default = (fastify) => async (socket2) => {
    try {
        const cookieHeader = socket2.handshake.headers.cookie ?? ""
        const { auth: auth3 } = fastify.parseCookie(cookieHeader)
        if (!auth3) {
            socket2.emit("errors", "AUTH_TOKEN_MISSING")
            socket2.disconnect(true)
            return
        }
        const tokenParts = auth3.split(".")
        const cleanToken = tokenParts.length >= 3 ? tokenParts.slice(0, 3).join(".") : auth3
        const { id } = fastify.jwt.verify(cleanToken)
        const [user] = await db
            .select()
            .from(table.users)
            .where(
                (0, import_drizzle_orm21.and)(
                    (0, import_drizzle_orm21.isNull)(table.users.ban),
                    (0, import_drizzle_orm21.eq)(table.users.id, id)
                )
            )
        if (!user) {
            socket2.emit("errors", "USER_NOT_FOUND")
            socket2.disconnect(true)
        }
        socket2.user = user
        socket2.join(socket2.user.id)
        UserStatusChanged(socket2)
        TypingStatusChanged(socket2)
    } catch (error2) {
        console.error(`Socket ${socket2.id} authentication failed:`, error2)
        socket2.emit("errors", "Invalid authentication token")
        socket2.disconnect(true)
        return
    }
}

// src/index.ts
var import_fastify = __toESM(require("fastify"))

// src/hooks/error.ts
async function error(fastify) {
    fastify.addHook("onError", (_, __, error2) => {
        if ((Error.isError(error2) && error2.message.startsWith("Rate limit exceeded")) || isFastifyError(error2)) {
            throw error2
        } else {
            console.trace(error2)
            throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
        }
    })
}

// src/hooks/index.ts
async function Hooks(fastify) {
    await error(fastify)
}

// ../../../api/others/routine/type.ts
var import_typebox22 = require("typebox")

// ../../../api/others/type.ts
var import_typebox21 = require("typebox")
var ErrorResponse2 = import_typebox21.Type.Object({
    statusCode: import_typebox21.Type.Number(),
    error: import_typebox21.Type.String(),
    message: import_typebox21.Type.String(),
    details: import_typebox21.Type.Optional(import_typebox21.Type.Any())
})

// ../../../api/others/routine/type.ts
var ClassSchedule = import_typebox22.Type.Object({
    time: import_typebox22.Type.String(),
    subject: import_typebox22.Type.String(),
    teacher: import_typebox22.Type.String(),
    classroom: import_typebox22.Type.String()
})
var DailySchedule = import_typebox22.Type.Object({
    1: ClassSchedule,
    2: ClassSchedule,
    3: ClassSchedule,
    4: ClassSchedule,
    5: ClassSchedule,
    6: ClassSchedule,
    7: ClassSchedule
})
var CodeType = import_typebox22.Type.TemplateLiteral([
    import_typebox22.Type.Union([
        import_typebox22.Type.Literal("67"),
        import_typebox22.Type.Literal("68"),
        import_typebox22.Type.Literal("69"),
        import_typebox22.Type.Literal("72"),
        import_typebox22.Type.Literal("85"),
        import_typebox22.Type.Literal("92")
    ]),
    import_typebox22.Type.Literal("-"),
    import_typebox22.Type.Union([
        import_typebox22.Type.Literal("1"),
        import_typebox22.Type.Literal("2"),
        import_typebox22.Type.Literal("3"),
        import_typebox22.Type.Literal("4"),
        import_typebox22.Type.Literal("5"),
        import_typebox22.Type.Literal("6"),
        import_typebox22.Type.Literal("7")
    ]),
    import_typebox22.Type.Union([import_typebox22.Type.Literal("A"), import_typebox22.Type.Literal("B")]),
    import_typebox22.Type.Union([import_typebox22.Type.Literal("1"), import_typebox22.Type.Literal("2")])
])
var RoutineData = import_typebox22.Type.Object({
    code: CodeType,
    load: import_typebox22.Type.String(),
    class: import_typebox22.Type.Object({
        Sunday: DailySchedule,
        Monday: DailySchedule,
        Tuesday: DailySchedule,
        Wednesday: DailySchedule,
        Thursday: DailySchedule
    }),
    teacher: import_typebox22.Type.Array(
        import_typebox22.Type.Object({
            name: import_typebox22.Type.String(),
            designation: import_typebox22.Type.String(),
            mobile: import_typebox22.Type.String(),
            subject: import_typebox22.Type.String()
        })
    )
})
var PostBody = import_typebox22.Type.Object({
    year: import_typebox22.Type.String(),
    department: import_typebox22.Type.String(),
    semester: import_typebox22.Type.String(),
    shift: import_typebox22.Type.String(),
    group: import_typebox22.Type.String()
})
var PutQuery = import_typebox22.Type.Object({
    key: import_typebox22.Type.String(),
    year: import_typebox22.Type.Optional(import_typebox22.Type.String())
})
var PutResponse = import_typebox22.Type.Optional(
    import_typebox22.Type.Object({
        id: import_typebox22.Type.String(),
        message: import_typebox22.Type.String()
    })
)
var PostSchema = {
    body: PostBody,
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        200: RoutineData
    }
}
var PutSchema = {
    querystring: PutQuery,
    body: RoutineData,
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        201: PutResponse
    }
}

// ../../../api/others/function/error.ts
var import_error5 = __toESM(require("@fastify/error"))
function isFastifyError3(error2) {
    return error2 instanceof import_error5.FastifyError
}
function CreateError3(statusCode, code, message2, details) {
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600) {
        throw new TypeError("statusCode must be a valid HTTP status code (100-599)")
    }
    if (!code || typeof code !== "string" || code.trim().length === 0) {
        throw new TypeError("code must be a non-empty string")
    }
    if (!message2 || typeof message2 !== "string" || message2.trim().length === 0) {
        throw new TypeError("message must be a non-empty string")
    }
    const CustomError = (0, import_error5.default)(code.trim().toUpperCase(), message2, statusCode)
    const errorInstance = new CustomError()
    if (details && Object.keys(details).length > 0) {
        Object.assign(errorInstance, { details: { ...details } })
    }
    return errorInstance
}

// ../../../api/others/routine/database/index.ts
var import_postgres_js2 = require("drizzle-orm/postgres-js")

// ../../../api/others/routine/database/routine.ts
var import_pg_core4 = require("drizzle-orm/pg-core")
var import_drizzle_orm22 = require("drizzle-orm")
var import_uuid5 = require("uuid")
var routine = (0, import_pg_core4.pgTable)(
    "routine",
    {
        id: (0, import_pg_core4.uuid)("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => (0, import_uuid5.v7)()),
        year: (0, import_pg_core4.char)("year", { length: 4 })
            .notNull()
            .$defaultFn(() => /* @__PURE__ */ new Date().getFullYear().toString()),
        code: (0, import_pg_core4.char)("code", { length: 6 }).notNull(),
        load: (0, import_pg_core4.varchar)("load").notNull(),
        class: (0, import_pg_core4.jsonb)("class").$type().notNull(),
        teacher: (0, import_pg_core4.jsonb)("teacher").$type().notNull()
    },
    (table4) => [
        (0, import_pg_core4.check)(
            "code_pattern",
            import_drizzle_orm22.sql`${table4.code} ~ '^(67|68|69|72|85|92)-[1-7][AB][12]$'`
        )
    ]
)

// ../../../api/others/routine/database/index.ts
var import_postgres2 = __toESM(require("postgres"))
var db2 = (0, import_postgres_js2.drizzle)({ client: (0, import_postgres2.default)(process.env.DATABASE_URI) })
var table2 = { routine }

// ../../../api/others/routine/routes/post.ts
var import_drizzle_orm23 = require("drizzle-orm")
async function post(request, reply2) {
    try {
        const { year, department, semester, shift, group } = request.body
        const [data] = await db2
            .select()
            .from(table2.routine)
            .where(
                (0, import_drizzle_orm23.and)(
                    (0, import_drizzle_orm23.eq)(table2.routine.year, year),
                    (0, import_drizzle_orm23.eq)(table2.routine.code, `${department}-${semester}${group}${shift}`)
                )
            )
        if (!data) throw CreateError3(404, "ROUTINE_NOT_FOUND", "Routine not found")
        return reply2.code(200).send(data)
    } catch (error2) {
        if (isFastifyError3(error2)) throw error2
        console.trace(error2)
        throw CreateError3(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}

// ../../../api/others/routine/routes/put.ts
async function put(request, reply2) {
    try {
        const routine2 = request.body
        const { key, year } = request.query
        if (key !== process.env.SECRET) throw CreateError3(403, "FORBIDDEN", "Forbidden")
        const [result] = await db2
            .insert(table2.routine)
            .values({ ...routine2, year })
            .returning()
        return reply2.code(201).send({ id: result.id, message: "Routine Created successfully" })
    } catch (error2) {
        if (isFastifyError3(error2)) throw error2
        console.trace(error2)
        throw CreateError3(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
    }
}

// ../../../api/others/routine/index.ts
function Routine(fastify) {
    fastify.route({ method: "POST", url: "/routine", schema: PostSchema, handler: post })
    fastify.route({ method: "PUT", url: "/routine", schema: PutSchema, handler: put })
}

// ../../../api/others/vaultly/type.ts
var import_typebox23 = require("typebox")
var PostBody2 = import_typebox23.Type.Object({
    id: import_typebox23.Type.String(),
    key: import_typebox23.Type.String()
})
var PostResponse = import_typebox23.Type.Object({
    id: import_typebox23.Type.String(),
    message: import_typebox23.Type.String()
})
var PutBody = import_typebox23.Type.Object({
    key: import_typebox23.Type.String(),
    message: import_typebox23.Type.String(),
    expires: import_typebox23.Type.Optional(
        import_typebox23.Type.Union([import_typebox23.Type.String(), import_typebox23.Type.Null()])
    ),
    one_time: import_typebox23.Type.Optional(import_typebox23.Type.Boolean())
})
var PutResponse2 = import_typebox23.Type.Object({
    id: import_typebox23.Type.String(),
    message: import_typebox23.Type.String(),
    expires: import_typebox23.Type.Optional(
        import_typebox23.Type.Union([import_typebox23.Type.String(), import_typebox23.Type.Null()])
    ),
    one_time: import_typebox23.Type.Optional(import_typebox23.Type.Boolean())
})
var PostSchema2 = {
    body: PostBody2,
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        200: PostResponse
    }
}
var PutSchema2 = {
    body: PutBody,
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        200: PutResponse2
    }
}

// ../../../api/others/vaultly/routes/post.ts
var import_node_crypto5 = require("node:crypto")

// ../../../api/others/vaultly/database/index.ts
var import_postgres_js3 = require("drizzle-orm/postgres-js")

// ../../../api/others/vaultly/database/message.ts
var import_pg_core5 = require("drizzle-orm/pg-core")
var import_drizzle_orm24 = require("drizzle-orm")
var import_uuid6 = require("uuid")
var message = (0, import_pg_core5.pgTable)(
    "message",
    {
        id: (0, import_pg_core5.uuid)("id")
            .unique()
            .primaryKey()
            .$defaultFn(() => (0, import_uuid6.v7)()),
        key: (0, import_pg_core5.char)("key", { length: 128 }).notNull(),
        message: (0, import_pg_core5.text)("message").notNull(),
        one_time: (0, import_pg_core5.boolean)("one_time").default(false),
        expires: (0, import_pg_core5.timestamp)("expires", { mode: "date" })
    },
    (table4) => [(0, import_pg_core5.check)("key_length", import_drizzle_orm24.sql`length(${table4.key}) = 128`)]
)

// ../../../api/others/vaultly/database/index.ts
var import_postgres3 = __toESM(require("postgres"))
var db3 = (0, import_postgres_js3.drizzle)({ client: (0, import_postgres3.default)(process.env.DATABASE_URI) })
var table3 = { message }

// ../../../api/others/vaultly/routes/post.ts
var import_drizzle_orm25 = require("drizzle-orm")
var import_uuid7 = require("uuid")
async function post2(request, reply2) {
    try {
        const { id, key } = request.body
        if (!(0, import_uuid7.validate)(id)) {
            return reply2.code(400).send({ error: "Invalid ID format" })
        }
        const message2 = (
            await db3
                .select()
                .from(table3.message)
                .where((0, import_drizzle_orm25.eq)(table3.message.id, id))
        ).shift()
        const hmac = (0, import_node_crypto5.createHmac)("sha512", process.env.SECRET).update(key).digest("hex")
        if (!message2) {
            return reply2.code(404).send({ error: "Message not found" })
        }
        if (message2.key !== hmac) {
            return reply2.code(403).send({ error: "Invalid key" })
        }
        if (message2.expires && new Date(message2.expires) < /* @__PURE__ */ new Date()) {
            await db3.delete(table3.message).where((0, import_drizzle_orm25.eq)(table3.message.id, id))
            return reply2.code(410).send({ error: "Message expired" })
        }
        if (message2.one_time) {
            await db3.delete(table3.message).where((0, import_drizzle_orm25.eq)(table3.message.id, id))
        }
        return {
            id: message2.id,
            message: decrypt(message2.key, message2.message)
        }
    } catch (error2) {
        console.log(error2)
        return reply2.code(500).send({ error: "Internal Server Error" })
    }
}
function decrypt(hmac, encryptedData) {
    const [encrypted, ivHex] = encryptedData.split(":")
    if (!encrypted || !ivHex) throw new Error("Invalid encrypted data format")
    const iv = Buffer.from(ivHex, "hex")
    const derivedKey = (0, import_node_crypto5.scryptSync)(process.env.SECRET, hmac, 32)
    const decipher = (0, import_node_crypto5.createDecipheriv)("aes-256-cbc", derivedKey, iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}

// ../../../api/others/vaultly/routes/put.ts
var import_node_crypto6 = require("node:crypto")
async function put2(request, reply2) {
    try {
        const { key, message: message2, expires = null, one_time = false } = request.body
        const hmac = (0, import_node_crypto6.createHmac)("sha512", process.env.SECRET).update(key).digest("hex")
        const encrypted = encrypt(hmac, message2)
        const [data] = await db3
            .insert(table3.message)
            .values({
                key: hmac,
                message: encrypted,
                expires: expires ? new Date(expires) : null,
                one_time: Boolean(one_time)
            })
            .returning()
        return { id: data.id, message: message2, expires, one_time }
    } catch (error2) {
        console.log(error2)
        return reply2.code(500).send({ error: "Internal Server Error" })
    }
}
function encrypt(hmac, text4) {
    const iv = (0, import_node_crypto6.randomBytes)(16)
    const derivedKey = (0, import_node_crypto6.scryptSync)(process.env.SECRET, hmac, 32)
    const cipher = (0, import_node_crypto6.createCipheriv)("aes-256-cbc", derivedKey, iv)
    let encrypted = cipher.update(text4, "utf8", "hex")
    encrypted += cipher.final("hex")
    return `${encrypted}:${iv.toString("hex")}`
}

// ../../../api/others/vaultly/index.ts
function Vaultly(fastify) {
    fastify.route({ method: "POST", url: "/vaultly", schema: PostSchema2, handler: post2 })
    fastify.route({ method: "PUT", url: "/vaultly", schema: PutSchema2, handler: put2 })
}

// ../../../api/others/xcfbot/routes/auth.ts
async function auth2(request, reply2) {
    throw CreateError3(501, "NOT_IMPLEMENTED", "Implemented")
}

// ../../../api/others/xcfbot/index.ts
function xcfbot(fastify) {
    fastify.route({
        method: "POST",
        url: "/xcfbot/auth",
        schema: {
            response: {
                "4xx": ErrorResponse2,
                "5xx": ErrorResponse2
            }
        },
        handler: auth2
    })
}

// ../../../api/others/support/index.ts
var import_v103 = require("discord-api-types/v10")

// ../../../api/others/support/type.ts
var import_typebox24 = require("typebox")
var categories = {
    feature: "Feature Request",
    general: "General",
    bug: "Bug Report"
}
var WishlistSchema = {
    body: import_typebox24.Type.Object({
        fullName: import_typebox24.Type.String({
            minLength: 2,
            maxLength: 100
        }),
        email: import_typebox24.Type.String({
            format: "email",
            maxLength: 255,
            description: "Valid email address"
        })
    }),
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        200: import_typebox24.Type.Object({
            success: import_typebox24.Type.Boolean(),
            message: import_typebox24.Type.String()
        })
    }
}
var SupportSchema = {
    body: import_typebox24.Type.Object({
        name: import_typebox24.Type.String({
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z\\s]+$",
            description: "Full name (letters and spaces only)"
        }),
        email: import_typebox24.Type.String({
            format: "email",
            maxLength: 255,
            description: "Valid email address"
        }),
        category: import_typebox24.Type.Union(
            Object.keys(categories).map((x) => import_typebox24.Type.Literal(x)),
            { description: "Message category" }
        ),
        subject: import_typebox24.Type.String({
            minLength: 5,
            maxLength: 200,
            description: "Message subject"
        }),
        message: import_typebox24.Type.String({
            minLength: 10,
            maxLength: 3800,
            description: "Message content"
        })
    }),
    response: {
        "4xx": ErrorResponse2,
        "5xx": ErrorResponse2,
        200: import_typebox24.Type.Object({
            success: import_typebox24.Type.Boolean(),
            message: import_typebox24.Type.String()
        })
    }
}

// ../../../api/others/support/index.ts
var import_snowtransfer3 = require("snowtransfer")
var client2 = new import_snowtransfer3.SnowTransfer(process.env.TOKEN)
function Support(fastify) {
    fastify.route({
        method: "POST",
        url: "/support",
        schema: SupportSchema,
        handler: async function (request, reply2) {
            try {
                const { name, email, category, subject, message: message2 } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"
                await client2.channel.createMessage(process.env.CHANNEL, {
                    flags: import_v103.MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: import_v103.ComponentType.Container,
                            components: [
                                {
                                    type: import_v103.ComponentType.TextDisplay,
                                    content: `## ${categories[category] ?? "Support"} - ${subject}`
                                },
                                {
                                    type: import_v103.ComponentType.Separator
                                },
                                {
                                    type: import_v103.ComponentType.TextDisplay,
                                    content: `**Name:** ${name}
**Email:** ${email}
**Subject:** ${subject}
**Origin:** ${host}

**Message:**
${message2}`
                                }
                            ]
                        }
                    ]
                })
                return reply2.status(200).send({
                    success: true,
                    message: "Support request submitted successfully"
                })
            } catch (error2) {
                if (isFastifyError3(error2)) {
                    throw error2
                } else {
                    console.trace(error2)
                    throw CreateError3(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
    fastify.route({
        method: "POST",
        url: "/wishlist",
        schema: WishlistSchema,
        handler: async function (request, reply2) {
            try {
                const { fullName, email } = request.body
                const host = request.headers.origin ?? request.headers.referer ?? "Unknown Host"
                await client2.channel.createMessage(process.env.CHANNEL, {
                    flags: import_v103.MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: import_v103.ComponentType.Container,
                            components: [
                                {
                                    type: import_v103.ComponentType.TextDisplay,
                                    content: `Wishlist Signup`
                                },
                                {
                                    type: import_v103.ComponentType.Separator
                                },
                                {
                                    type: import_v103.ComponentType.TextDisplay,
                                    content: `**Name:** ${fullName}
**Email:** ${email}
**Origin:** ${host}
**Timestamp:** ${/* @__PURE__ */ new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}`
                                }
                            ]
                        }
                    ]
                })
                return reply2.status(200).send({
                    success: true,
                    message: "Successfully joined the wishlist"
                })
            } catch (error2) {
                if (isFastifyError3(error2)) {
                    throw error2
                } else {
                    console.trace(error2)
                    throw CreateError3(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
                }
            }
        }
    })
}

// ../../../api/others/index.ts
function Others(fastify) {
    Routine(fastify)
    Support(fastify)
    Vaultly(fastify)
    xcfbot(fastify)
}

// src/index.ts
var io
async function main() {
    const isDevelopment = process.env.NODE_ENV === "development"
    const fastify = (0, import_fastify.default)({
        trustProxy: true,
        logger: {
            formatters: { level: (level, number) => ({ level: `${level} (${number})` }) },
            file: isDevelopment ? "./log.json" : void 0
        },
        schemaErrorFormatter: ValidationErrorHandler
    }).withTypeProvider()
    await Plugin(fastify)
    Decorate(fastify)
    Routes(fastify)
    Hooks(fastify)
    Others(fastify)
    await fastify.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 7200) })
    console.log(`Server listening at http://localhost:7200`)
    fastify.io.on("connection", socket_default(fastify))
    io = fastify.io
    return fastify
}
process.on("uncaughtException", (err, origin) => xcf(err, "Uncaught Exception", origin, false))
process.on("unhandledRejection", (reason, origin) => xcf(reason, "Unhandled Rejection", origin, false))
process.on("uncaughtExceptionMonitor", (err, origin) => xcf(err, "Uncaught Exception", origin, false))
main()
// Annotate the CommonJS export names for ESM import in node:
0 &&
    (module.exports = {
        io,
        main
    })
