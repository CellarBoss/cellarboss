import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import type { Hono } from 'hono';
import { createTestApp, createTestAppWithAuth, runMigrations, createTestWineMaker, createTestRegion, createTestCountry, createTestGrape, createTestVintage } from './setup.js';
import { registerWineRoutes } from '@routes/wines.routes.js';
import { db } from '@utils/database.js';

describe('Wine API', () => {
  let testWineMakerId: number;
  let testRegionId: number;

  beforeAll(async () => {
    await runMigrations(db);
  });

  describe('without auth', () => {
    let app: Hono;

    beforeEach(() => {
      app = createTestApp();
      registerWineRoutes(app);
    });

    it('GET /wine returns 401', async () => {
      const res = await app.request('/wine');
      expect(res.status).toBe(401);
    });

    it('POST /wine returns 401', async () => {
      const res = await app.request('/wine', { method: 'POST' });
      expect(res.status).toBe(401);
    });

    it('GET /wine/:id returns 401', async () => {
      const res = await app.request('/wine/1');
      expect(res.status).toBe(401);
    });

    it('PUT /wine/:id returns 401', async () => {
      const res = await app.request('/wine/1', { method: 'PUT' });
      expect(res.status).toBe(401);
    });

    it('DELETE /wine/:id returns 401', async () => {
      const res = await app.request('/wine/1', { method: 'DELETE' });
      expect(res.status).toBe(401);
    });
  });

  describe('Authenticated operations', () => {
    let app: Hono;

    beforeEach(async () => {
      // Create prerequisite data
      const wineMaker = await createTestWineMaker(db, 'Château Margaux Estate');
      testWineMakerId = wineMaker.id;

      const country = await createTestCountry(db, 'France');
      const region = await createTestRegion(db, country.id, 'Bordeaux');
      testRegionId = region.id;

      app = createTestAppWithAuth();
      registerWineRoutes(app);
    });

    describe('GET /wine', () => {
      it('returns 200 with empty array', async () => {
        const res = await app.request('/wine');
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe('POST /wine', () => {
      it('returns 400 with invalid data', async () => {
        const res = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' }),
        });
        expect(res.status).toBe(400);
      });

      it('creates a wine with valid data', async () => {
        const res = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Château Margaux',
            wineMakerId: testWineMakerId,
            regionId: testRegionId
          }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe('Château Margaux');
      });
    });

    describe('GET /wine/:id', () => {
      it('returns 404 for non-existent wine', async () => {
        const res = await app.request('/wine/999');
        expect(res.status).toBe(404);
      });

      it('returns wine by id', async () => {
        const createRes = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Opus One',
            wineMakerId: testWineMakerId,
            regionId: null
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe('Opus One');
      });
    });

    describe('PUT /wine/:id', () => {
      it('updates a wine', async () => {
        const createRes = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Penfolds Grange',
            wineMakerId: testWineMakerId,
            regionId: null
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regionId: 2 }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.regionId).toBe(2);
      });
    });

    describe('DELETE /wine/:id', () => {
      it('deletes a wine', async () => {
        const createRes = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Dom Pérignon',
            wineMakerId: testWineMakerId,
            regionId: null
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`, {
          method: 'DELETE',
        });
        expect(res.status).toBe(200);
        expect(res.json()).resolves.toEqual({ success: true });
      });

      it('cascade-deletes winegrape records when deleting a wine', async () => {
        const wine = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Cascade Test Wine',
            wineMakerId: testWineMakerId,
            regionId: null
          }),
        });
        const createdWine = await wine.json();

        const grape = await createTestGrape(db, 'Shiraz');
        await db
          .insertInto('winegrape')
          .values({ wineId: createdWine.id, grapeId: grape.id })
          .execute();

        const res = await app.request(`/wine/${createdWine.id}`, {
          method: 'DELETE',
        });
        expect(res.status).toBe(200);

        const remaining = await db
          .selectFrom('winegrape')
          .selectAll()
          .where('wineId', '=', createdWine.id)
          .execute();
        expect(remaining).toHaveLength(0);
      });

      it('returns 409 when wine has vintages', async () => {
        const wine = await app.request('/wine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Vintage Block Test Wine',
            wineMakerId: testWineMakerId,
            regionId: null
          }),
        });
        const createdWine = await wine.json();

        await createTestVintage(db, createdWine.id, 2020);

        const res = await app.request(`/wine/${createdWine.id}`, {
          method: 'DELETE',
        });
        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toContain('still has vintages');
      });
    });
  });
});
