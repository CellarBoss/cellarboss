import { db } from "@utils/database.js";
import { Kysely } from "kysely";

// The user table is managed by better-auth; cast db to Kysely<any> for direct queries
const userDb = db as Kysely<any>;

export async function getById(id: string) {
  return await userDb
    .selectFrom("user")
    .select(["id", "name", "email", "role", "createdAt", "banned", "banReason"])
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function update(
  id: string,
  data: { name?: string; email?: string },
) {
  const values = { ...data, updatedAt: new Date().toISOString() };
  await userDb
    .updateTable("user")
    .set(values)
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
  return await userDb
    .selectFrom("user")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
