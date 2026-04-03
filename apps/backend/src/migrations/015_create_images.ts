import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("image")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("vintageId", "integer", (col) =>
      col.notNull().references("vintage.id").onDelete("cascade"),
    )
    .addColumn("filename", "text", (col) => col.notNull())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("isFavourite", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("createdBy", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("createdAt", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_image_vintageId")
    .on("image")
    .column("vintageId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("idx_image_vintageId").execute();
  await db.schema.dropTable("image").execute();
}
