import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("vintage")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("year", "integer")
    .addColumn("wineId", "integer", (col) =>
      col.notNull().references("wine.id"),
    )
    .addColumn("drinkFrom", "integer")
    .addColumn("drinkUntil", "integer")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("vintage").execute();
}
