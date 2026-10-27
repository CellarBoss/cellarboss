import { betterAuth } from "better-auth";
import { admin, bearer } from "better-auth/plugins";
import { getDialect } from "@db";
import { env } from "./env";

/**
 * Origin sent by the CellarBoss mobile app, built from the Expo `scheme` in
 * apps/mobile/app.config.ts. Browsers can never send a custom-scheme origin,
 * so trusting it does not weaken CSRF protection for the web frontend.
 */
export const MOBILE_APP_ORIGIN = "cellarboss://";

export function getTrustedOrigins(cors: string | undefined): string[] {
  const webOrigins = (cors || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...webOrigins, MOBILE_APP_ORIGIN];
}

export const auth = betterAuth({
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(env.CORS),
  database: {
    dialect: getDialect(),
    type: env.DATABASE_TYPE,
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
    bearer(),
  ],
});
