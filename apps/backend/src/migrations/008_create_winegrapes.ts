import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await addIdColumn(db.schema.createTable("winegrape"))
    .addColumn("wineId", "integer", (col) =>
      col.notNull().references("wine.id"),
    )
    .addColumn("grapeId", "integer", (col) =>
      col.notNull().references("grape.id"),
    )
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("winegrape").execute();
}
