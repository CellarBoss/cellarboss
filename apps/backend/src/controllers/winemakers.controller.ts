import { db } from '@utils/database.js';
import type { CreateWineMaker, UpdateWineMaker } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('winemaker').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('winemaker')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateWineMaker) {
  return await db
    .insertInto('winemaker')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateWineMaker) {
  return await db
    .updateTable('winemaker')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('winemaker')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
