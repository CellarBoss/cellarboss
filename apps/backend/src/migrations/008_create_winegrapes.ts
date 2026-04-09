import type { Kysely } from "kysely";
import { addIdColumn } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("winegrape"))
    .addColumn("wineId", "integer", (col) =>
      col.notNull().references("wine.id"),
    )
    .addColumn("grapeId", "integer", (col) =>
      col.notNull().references("grape.id"),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("winegrape").execute();
}
