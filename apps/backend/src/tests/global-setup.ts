import { config } from 'dotenv';

export async function setup() {
  // Load .env.test file first
  config({ path: '.env.test' });

  // Now import database and setup after env is loaded
  const { db } = await import('@utils/database.js');
  const { runMigrations } = await import('./setup.js');

  // Run migrations on the main db instance (which uses :memory: in tests)
  console.log('Running migrations for tests...');
  await runMigrations(db);
  console.log('Migrations complete');
}

export async function teardown() {
  const { db } = await import('@utils/database.js');
  await db.destroy();
}
