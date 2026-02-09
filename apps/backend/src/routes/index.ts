import type { Hono } from 'hono';
import { registerBottleRoutes } from './bottles.routes.js';
import { registerCountryRoutes } from './countries.routes.js';
import { registerGrapeRoutes } from './grapes.routes.js';
import { registerLocationRoutes } from './locations.routes.js';
import { registerRegionRoutes } from './regions.routes.js';
import { registerStorageRoutes } from './storages.routes.js';
import { registerVintageRoutes } from './vintages.routes.js';
import { registerWineRoutes } from './wines.routes.js';
import { registerWineGrapeRoutes } from './winegrapes.routes.js';
import { registerWineMakerRoutes } from './winemakers.routes.js';

export function registerRoutes(app: Hono) {
  registerBottleRoutes(app);
  registerCountryRoutes(app);
  registerGrapeRoutes(app);
  registerLocationRoutes(app);
  registerRegionRoutes(app);
  registerStorageRoutes(app);
  registerVintageRoutes(app);
  registerWineRoutes(app);
  registerWineGrapeRoutes(app);
  registerWineMakerRoutes(app);
}
