import { db } from '@utils/database.js';
import type { CreateVintage, UpdateVintage } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('vintage').selectAll().execute();
}

export async function getByWineId(wineId: number) {
  return await db
    .selectFrom('vintage')
    .selectAll()
    .where('wineId', '=', wineId)
    .execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('vintage')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function create(data: CreateVintage) {
  return await db
    .insertInto('vintage')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateVintage) {
  return await db
    .updateTable('vintage')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('vintage')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
