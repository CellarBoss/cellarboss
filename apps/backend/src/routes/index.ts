import type { OpenAPIHono } from "@hono/zod-openapi";
import { registerBottleRoutes } from "./bottles.routes";
import { registerCountryRoutes } from "./countries.routes";
import { registerGrapeRoutes } from "./grapes.routes";
import { registerLocationRoutes } from "./locations.routes";
import { registerRegionRoutes } from "./regions.routes";
import { registerStorageRoutes } from "./storages.routes";
import { registerVintageRoutes } from "./vintages.routes";
import { registerWineRoutes } from "./wines.routes";
import { registerWineGrapeRoutes } from "./winegrapes.routes";
import { registerWineMakerRoutes } from "./winemakers.routes";
import { registerSettingsRoutes } from "./settings.routes";
import { registerTastingNoteRoutes } from "./tasting-notes.routes";
import { registerUserRoutes } from "./users.routes";
import { registerVersionRoutes } from "./version.routes";
import { registerImageRoutes } from "./images.routes";

export function registerRoutes(app: OpenAPIHono) {
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
  registerSettingsRoutes(app);
  registerTastingNoteRoutes(app);
  registerUserRoutes(app);
  registerVersionRoutes(app);
  registerImageRoutes(app);
}
