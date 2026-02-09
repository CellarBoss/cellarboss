import { db } from '@utils/database.js';
import type { CreateStorage, UpdateStorage } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('storage').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('storage')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateStorage) {
  return await db
    .insertInto('storage')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateStorage) {
  return await db
    .updateTable('storage')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('storage')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
