import type { BaseImporter } from "../base-importer.js";

/**
 * Site adapters, checked in order before the generic fallback. Add a new
 * site by writing its adapter in this folder and listing it here.
 */
export const siteImporters: BaseImporter[] = [];
