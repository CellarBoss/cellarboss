import { db } from '@utils/database.js';
import type { CreateCountry, UpdateCountry } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('country').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('country')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateCountry) {
  return await db
    .insertInto('country')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateCountry) {
  return await db
    .updateTable('country')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('country')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
