import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("image"))
    .addColumn("vintageId", "integer", (col) =>
      col.notNull().references("vintage.id").onDelete("cascade"),
    )
    .addColumn("filename", shortText(), (col) => col.notNull())
    .addColumn("size", "integer", (col) => col.notNull())
    // isFavourite is stored as 0/1 integer on all dialects to match the
    // application schema (ColumnType<number, ...>). Use the boolean() helper
    // for new columns where you want native boolean semantics.
    .addColumn("isFavourite", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("createdBy", shortText(), (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("createdAt", shortText(), (col) => col.notNull())
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
