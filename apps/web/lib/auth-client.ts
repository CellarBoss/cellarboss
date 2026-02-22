import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { webEnv } from "./env"

export const authClient = createAuthClient({
    baseURL: webEnv.CELLARBOSS_SERVER,
    plugins: [adminClient()],
})
