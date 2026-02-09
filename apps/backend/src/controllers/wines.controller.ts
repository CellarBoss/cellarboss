import { db } from '@utils/database.js';
import type { CreateWine, UpdateWine } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('wine').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('wine')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateWine) {
  return await db
    .insertInto('wine')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateWine) {
  return await db
    .updateTable('wine')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('wine')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
