import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "postgresql",
    schema: ["./src/routine/database", "./src/vaultly/database"],
    dbCredentials: { url: process.env.DATABASE_URI }
})
