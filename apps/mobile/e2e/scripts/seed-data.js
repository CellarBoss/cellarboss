// Maestro runScript: Seeds the mock server with a valid session and resets state.
// Uses 10.0.2.2 for Android emulator (maps to host localhost).
// Change to localhost for iOS simulator.
const BASE_URL = "http://10.0.2.2:5174";

async function seed() {
  // Reset state to defaults
  await fetch(`${BASE_URL}/__test/reset`, { method: "POST" });

  // Ensure a valid session exists
  await fetch(`${BASE_URL}/__test/set-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: {
        id: "admin-user-1",
        name: "Test Admin",
        email: "admin@cellarboss.test",
        role: "admin",
      },
      session: {
        id: "session-admin-1",
        token: "token-admin",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    }),
  });
}

seed();
