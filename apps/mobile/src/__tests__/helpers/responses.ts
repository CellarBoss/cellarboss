/** Build fetch Responses for tests that exercise real HTTP clients */

export function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

export function htmlResponse(status = 200): Response {
  return new Response("<!DOCTYPE html><html><body>Login</body></html>", {
    status,
    headers: { "content-type": "text/html" },
  });
}

/** The Set-Cookie header Better Auth sends after a successful sign-in */
export const SESSION_SET_COOKIE =
  "better-auth.session_token=abc.signature; Path=/; HttpOnly; SameSite=Lax";

/** The Cookie header the Expo client sends back after that sign-in */
export const SESSION_COOKIE = "better-auth.session_token=abc.signature";

/** The Set-Cookie header Better Auth sends on sign-out */
export const CLEARED_SET_COOKIE =
  "better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax";

/** What the Expo client keeps in secure store after that sign-in */
export const STORED_SESSION = JSON.stringify({
  "better-auth.session_token": { value: "abc.signature", expires: null },
});
