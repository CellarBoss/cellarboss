import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { getDialect } from "@db";
import { env } from "./env.js";

export const auth = betterAuth({
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: (env.CORS || "http://localhost:3000").split(","),
  database: {
    dialect: getDialect(),
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
});
