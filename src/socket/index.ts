import { ClientToServerEvents, ServerToClientEvents, UserStatus, JWTPayload } from "../type"
import { Socket } from "socket.io"
import { main } from "../"

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
    user?: JWTPayload
}

export default (fastify: Awaited<ReturnType<typeof main>>) => (socket: AuthenticatedSocket) => {
    console.log(`Socket ${socket.id} attempting to connect`)

    try {
        const cookieHeader = socket.handshake.headers.cookie

        if (!cookieHeader) {
            console.log(`Socket ${socket.id}: No cookies provided`)
            socket.emit("error", {
                message: "Authentication required",
                code: "NO_COOKIES"
            })
            socket.disconnect(true)
            return
        }

        const cookies = fastify.parseCookie(cookieHeader)
        const authCookie = cookies.auth

        if (!authCookie) {
            console.log(`Socket ${socket.id}: No auth cookie found`)
            socket.emit("error", {
                message: "Authentication token not found",
                code: "NO_AUTH_COOKIE"
            })
            socket.disconnect(true)
            return
        }

        const tokenParts = authCookie.split(".")
        const cleanToken = tokenParts.length >= 3 ? tokenParts.slice(0, 3).join(".") : authCookie
        const decoded = fastify.jwt.verify(cleanToken) as JWTPayload

        socket.user = decoded

        console.log(`User ${socket.user.username} (${socket.user.id}) connected with socket ${socket.id}`)
        socket.join(socket.user.id)

        socket.broadcast.emit("user_status_changed", socket.user.id, "online")
    } catch (error) {
        console.error(`Socket ${socket.id} authentication failed:`, error)
        socket.emit("error", {
            message: "Invalid authentication token",
            code: "AUTH_FAILED"
        })
        socket.disconnect(true)
        return
    }

    socket.on("disconnect", (reason) => {
        console.log(`User ${socket.user?.username} (${socket.user?.id}) disconnected: ${reason}`)

        if (socket.user) {
            socket.broadcast.emit("user_status_changed", socket.user.id, "offline")
        }
    })

    socket.on("update_status", (status) => {
        if (!socket.user) {
            return socket.emit("error", {
                message: "Not authenticated",
                code: "UNAUTHORIZED"
            })
        }

        try {
            const validStatuses: UserStatus[] = ["online", "offline"]

            if (!status || !validStatuses.includes(status)) {
                return socket.emit("error", {
                    message: "Invalid status. Must be 'online' or 'offline'",
                    code: "INVALID_STATUS"
                })
            }

            socket.broadcast.emit("user_status_changed", socket.user.id, status)

            console.log(`User ${socket.user.username} status updated to: ${status}`)
        } catch (error) {
            console.error("Error handling update_status:", error)
            socket.emit("error", {
                message: "Failed to update status",
                code: "STATUS_UPDATE_FAILED"
            })
        }
    })

    socket.on("typing", (chatId, isTyping) => {
        if (!socket.user) {
            return socket.emit("error", {
                message: "Not authenticated",
                code: "UNAUTHORIZED"
            })
        }

        try {
            if (!chatId || typeof chatId !== "string") {
                return socket.emit("error", {
                    message: "Chat ID is required",
                    code: "INVALID_CHAT_ID"
                })
            }

            if (typeof isTyping !== "boolean") {
                return socket.emit("error", {
                    message: "isTyping must be a boolean",
                    code: "INVALID_TYPING_STATUS"
                })
            }

            socket.to(chatId).emit("user_typing", socket.user.id, isTyping)

            console.log(`${socket.user.username} ${isTyping ? "started" : "stopped"} typing in chat ${chatId}`)
        } catch (error) {
            console.error("Error handling typing:", error)
        }
    })

    socket.on("error", (error) => {
        console.error(`Socket error for user ${socket.user?.username}:`, error)
    })

    console.log(`Socket connection established for ${socket.user.username}`)
}
