import { sql, type Kysely } from "kysely";

const notesText = sql`varchar(5000)`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("wine")
    .addColumn("notes", notesText, (col) => col.notNull().defaultTo(""))
    .execute();
  await db.schema
    .alterTable("vintage")
    .addColumn("notes", notesText, (col) => col.notNull().defaultTo(""))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("vintage").dropColumn("notes").execute();
  await db.schema.alterTable("wine").dropColumn("notes").execute();
}
