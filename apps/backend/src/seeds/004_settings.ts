import type { Kysely } from 'kysely';

export async function seed(db: Kysely<any>): Promise<void> {
  await db.insertInto('setting').values([
    { key: 'currency', value: 'GBP' },
    { key: 'language', value: 'en' },
  ]).execute();

  console.log(`Seeded settings`);
}
