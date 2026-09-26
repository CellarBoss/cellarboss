import { db } from "@utils/database.js";

export async function getById(id: string) {
  return await db
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
  await db
    .updateTable("user")
    .set(values)
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
  return await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
