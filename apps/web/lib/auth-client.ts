import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: (process.env.CELLARBOSS_SERVER || "http://localhost:5000"),
    plugins: [adminClient()],
})
