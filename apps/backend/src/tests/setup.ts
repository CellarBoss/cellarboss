import { Hono } from 'hono';
import { Kysely, Migrator, type Migration, type MigrationProvider } from 'kysely';
import { vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { Database } from '@schema/database.js';
import { auth } from '@utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom migration provider that handles Windows ESM imports correctly
class CustomMigrationProvider implements MigrationProvider {
  constructor(private readonly migrationFolder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await fs.readdir(this.migrationFolder);

    for (const fileName of files) {
      if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
        const migrationName = fileName.replace(/\.(ts|js)$/, '');
        const filePath = path.join(this.migrationFolder, fileName);
        const fileUrl = pathToFileURL(filePath).href;
        const migration = await import(fileUrl);
        migrations[migrationName] = migration;
      }
    }

    return migrations;
  }
}

// Run migrations on a test database
export async function runMigrations(db: Kysely<Database>): Promise<void> {
  const migrationFolder = path.resolve(__dirname, '../migrations');

  const migrator = new Migrator({
    db,
    provider: new CustomMigrationProvider(migrationFolder),
  });

  const { error } = await migrator.migrateToLatest();

  if (error) {
    console.error('Failed to run test migrations:', error);
    throw error;
  }
}

// Create test app instance (unauthenticated)
export function createTestApp() {
  return new Hono();
}

// Create mock session data
export function createMockSession(userId: string = 'test-user-1', email: string = 'test@example.com') {
  return {
    session: {
      id: `session-${userId}`,
      userId,
      token: `token-${userId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    user: {
      id: userId,
      email,
      emailVerified: true,
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin' as const,
    },
  };
}

// Create authenticated test app (mocks auth.api.getSession)
export function createTestAppWithAuth(userId: string = 'test-user-1', email: string = 'test@example.com') {
  const app = new Hono();

  // Mock the auth.api.getSession method to return our mock session
  const mockSession = createMockSession(userId, email);
  vi.spyOn(auth.api, 'getSession').mockResolvedValue(mockSession);

  return app;
}

// Test fixture helpers - Create prerequisite records for testing
export async function createTestCountry(db: Kysely<Database>, name: string = 'Test Country') {
  await db.insertInto('country').values({ name }).onConflict((oc) => oc.column('name').doNothing()).execute();
  return await db.selectFrom('country').select('id').where('name', '=', name).executeTakeFirstOrThrow();
}

export async function createTestLocation(db: Kysely<Database>, name: string = 'Test Location') {
  await db.insertInto('location').values({ name }).onConflict((oc) => oc.column('name').doNothing()).execute();
  return await db.selectFrom('location').select('id').where('name', '=', name).executeTakeFirstOrThrow();
}

export async function createTestGrape(db: Kysely<Database>, name: string = 'Test Grape') {
  await db.insertInto('grape').values({ name }).onConflict((oc) => oc.column('name').doNothing()).execute();
  return await db.selectFrom('grape').select('id').where('name', '=', name).executeTakeFirstOrThrow();
}

export async function createTestWineMaker(db: Kysely<Database>, name: string = 'Test WineMaker') {
  return await db
    .insertInto('winemaker')
    .values({ name })
    .returning('id')
    .executeTakeFirstOrThrow();
}

export async function createTestRegion(db: Kysely<Database>, countryId: number, name: string = 'Test Region') {
  await db.insertInto('region').values({ name, countryId }).onConflict((oc) => oc.columns(['name', 'countryId']).doNothing()).execute();
  return await db.selectFrom('region').select('id').where('name', '=', name).where('countryId', '=', countryId).executeTakeFirstOrThrow();
}

export async function createTestStorage(db: Kysely<Database>, locationId: number | null = null, name: string = 'Test Storage') {
  return await db
    .insertInto('storage')
    .values({ name, locationId, parent: null })
    .returning('id')
    .executeTakeFirstOrThrow();
}

export async function createTestWine(db: Kysely<Database>, wineMakerId: number, regionId: number | null = null, name: string = 'Test Wine') {
  return await db
    .insertInto('wine')
    .values({ name, wineMakerId, regionId })
    .returning('id')
    .executeTakeFirstOrThrow();
}

export async function createTestVintage(db: Kysely<Database>, wineId: number, year: number | null = 2020) {
  return await db
    .insertInto('vintage')
    .values({ wineId, year, drinkFrom: null, drinkUntil: null })
    .returning('id')
    .executeTakeFirstOrThrow();
}
