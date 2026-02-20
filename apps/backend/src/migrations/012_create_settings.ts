import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('setting')
    .addColumn('key', 'text', (col) => col.primaryKey())
    .addColumn('value', 'text', (col) => col.notNull())
    .execute();
  
  await db.insertInto('setting').values([
    { key: 'currency', value: 'GBP' },
    { key: 'language', value: 'en' },
  ]).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('setting').execute();
}
