import { db } from '@utils/database.js';
import { Kysely } from 'kysely';

// The user table is managed by better-auth; cast db to Kysely<any> for direct queries
const userDb = db as Kysely<any>;

export async function getById(id: string) {
  return await userDb
    .selectFrom('user')
    .select(['id', 'name', 'email', 'role', 'createdAt', 'banned', 'banReason'])
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function update(id: string, data: { name?: string; email?: string }) {
  return await userDb
    .updateTable('user')
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}
