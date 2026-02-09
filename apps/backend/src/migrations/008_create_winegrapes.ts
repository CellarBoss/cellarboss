import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('winegrape')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('wineId', 'integer', (col) => col.notNull().references('wine.id'))
    .addColumn('grapeId', 'integer', (col) => col.notNull().references('grape.id'))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('winegrape').execute();
}
