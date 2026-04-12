import { config } from "dotenv";

export async function setup() {
  // Load .env.test file first
  config({ path: ".env.test" });

  // Now import database and setup after env is loaded
  const { db } = await import("@utils/database.js");
  const { runMigrations, createTestUser } = await import("./setup.js");

  // The "user" table is managed by Better Auth, not by app migrations, but
  // migrations 013/015 have FK references to user.id. PostgreSQL (and MySQL)
  // enforce FK targets at DDL time, so the table must exist before migrations.
  await createTestUser(db);

  // Run migrations on the main db instance (which uses :memory: in tests)
  console.log("Running migrations for tests...");
  await runMigrations(db);
  console.log("Migrations complete");
}

export async function teardown() {
  const { db } = await import("@utils/database.js");
  await db.destroy();
}
