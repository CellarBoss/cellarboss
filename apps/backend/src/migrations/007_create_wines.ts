import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await addIdColumn(db.schema.createTable("wine"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("type", shortText(), (col) => col.notNull())
    .addColumn("wineMakerId", "integer", (col) =>
      col.notNull().references("winemaker.id"),
    )
    .addColumn("regionId", "integer", (col) => col.references("region.id"))
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("wine").execute();
}
