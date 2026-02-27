import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tastingNote")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("vintageId", "integer", (col) =>
      col.notNull().references("vintage.id").onDelete("cascade"),
    )
    .addColumn("date", "text", (col) => col.notNull())
    .addColumn("author", "text", (col) => col.notNull())
    .addColumn("score", "real", (col) => col.notNull())
    .addColumn("notes", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_tastingNote_vintageId")
    .on("tastingNote")
    .column("vintageId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("tastingNote").execute();
}
