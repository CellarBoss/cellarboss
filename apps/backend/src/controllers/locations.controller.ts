import { db } from '@utils/database.js';
import type { CreateLocation, UpdateLocation } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('location').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('location')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateLocation) {
  return await db
    .insertInto('location')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateLocation) {
  return await db
    .updateTable('location')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('location')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
