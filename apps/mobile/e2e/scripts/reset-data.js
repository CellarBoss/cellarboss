// Maestro runScript: Resets the mock server state to defaults (preserves session).
// runScript executes on the host machine, so we use localhost directly.
const BASE_URL = "http://localhost:5174";

async function reset() {
  const res = await fetch(`${BASE_URL}/__test/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
}

reset();
