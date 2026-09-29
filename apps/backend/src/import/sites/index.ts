import type { BaseImporter } from "../base-importer.js";
import { NakedWinesImporter } from "./naked-wines.js";
import { TheWineSocietyImporter } from "./the-wine-society.js";
import { VivinoImporter } from "./vivino.js";

/**
 * Site adapters, checked in order before the generic fallback. Add a new
 * site by writing its adapter in this folder and listing it here.
 */
export const siteImporters: BaseImporter[] = [
  new TheWineSocietyImporter(),
  new NakedWinesImporter(),
  new VivinoImporter(),
];
