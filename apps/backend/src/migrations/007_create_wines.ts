import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("wine"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("type", shortText(), (col) => col.notNull())
    .addColumn("wineMakerId", "integer", (col) =>
      col.notNull().references("winemaker.id"),
    )
    .addColumn("regionId", "integer", (col) => col.references("region.id"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("wine").execute();
}
