import type { Kysely } from "kysely";
import { env } from "@utils/env.js";

const settings = [
  { key: "currency", value: "GBP" },
  { key: "language", value: "en" },
  { key: "date", value: "dd/MM/yyyy" },
];

export async function seed(db: Kysely<any>): Promise<void> {
  // "key" is the primary key and migration 013 already wrote "datetime".
  for (const setting of settings) {
    const query = db.insertInto("setting").values(setting);
    await (
      env.DATABASE_TYPE === "mysql"
        ? query.ignore()
        : query.onConflict((oc) => oc.column("key").doNothing())
    ).execute();
  }

  console.log(`Seeded ${settings.length} settings`);
}
