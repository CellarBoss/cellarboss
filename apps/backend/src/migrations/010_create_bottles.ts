import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bottle')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('purchaseDate', 'text', (col) => col.notNull())
    .addColumn('purchasePrice', 'real', (col) => col.notNull())
    .addColumn('vintageId', 'integer', (col) => col.notNull().references('vintage.id'))
    .addColumn('storageId', 'integer', (col) => col.references('storage.id'))
    .addColumn('status', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('bottle').execute();
}
