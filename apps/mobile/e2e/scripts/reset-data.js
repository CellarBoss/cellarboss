// Maestro runScript: Resets the mock server state to defaults (preserves session).
const BASE_URL = "http://10.0.2.2:5174";

async function reset() {
  await fetch(`${BASE_URL}/__test/reset`, { method: "POST" });
}

reset();
