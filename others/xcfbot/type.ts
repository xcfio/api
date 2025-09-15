export type UserData = {
    id: string
    username: string
    avatar: string
    email?: string
}

export type Ticket = {
    type: "discord" | "github"
    id: string
    subject: string
    category: string
    status: "open" | "pending" | "resolved" | "closed"
    createdAt: string
    updatedAt: string
    messages: Array<TicketMessage>
}

export type TicketMessage = {
    id: string
    content: string
    timestamp: string
    isStaff: boolean
    author: {
        name: string
        avatar?: string
    }
}
