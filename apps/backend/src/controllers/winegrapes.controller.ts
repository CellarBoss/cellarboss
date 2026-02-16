import { db } from '@utils/database.js';
import type { CreateWineGrape, UpdateWineGrape } from '@cellarboss/types';

export async function list() {
  return await db.selectFrom('winegrape').selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom('winegrape')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function getByWineId(wineId: number) {
  return await db
    .selectFrom('winegrape')
    .selectAll()
    .where('wineId', '=', wineId)
    .execute();
}

export async function create(data: CreateWineGrape) {
  return await db
    .insertInto('winegrape')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateWineGrape) {
  return await db
    .updateTable('winegrape')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom('winegrape')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}
