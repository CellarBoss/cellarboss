import type { Kysely } from "kysely";
import { addIdColumn, longText, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("tastingNote"))
    .addColumn("vintageId", "integer", (col) =>
      col.notNull().references("vintage.id").onDelete("cascade"),
    )
    .addColumn("date", shortText(), (col) => col.notNull())
    .addColumn("authorId", shortText(), (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("score", "integer", (col) => col.notNull())
    .addColumn("notes", longText(), (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_tastingNote_vintageId")
    .on("tastingNote")
    .column("vintageId")
    .execute();

  await db
    .insertInto("setting")
    .values({ key: "datetime", value: "dd/MM/yyyy HH:mm" })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("tastingNote").execute();
  await db.deleteFrom("setting").where("key", "=", "datetime").execute();
}
