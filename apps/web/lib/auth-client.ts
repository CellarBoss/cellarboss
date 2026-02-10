import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: (process.env.CELLARBOSS_SERVER || "http://localhost:5000"),
})