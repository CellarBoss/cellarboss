import type { BaseImporter } from "./base-importer.js";
import { GenericImporter } from "./sites/generic.js";
import { siteImporters } from "./sites/index.js";

export interface SupportedSite {
  id: string;
  label: string;
  hosts: string[];
}

/** Picks the importer for a URL, falling back to the generic one. */
export class ImporterRegistry {
  constructor(
    private readonly importers: BaseImporter[] = siteImporters,
    private readonly fallback: BaseImporter = new GenericImporter(),
  ) {}

  forUrl(url: URL): BaseImporter {
    return (
      this.importers.find((importer) => importer.canHandle(url)) ??
      this.fallback
    );
  }

  sites(): SupportedSite[] {
    return this.importers.map(({ id, label, hosts }) => ({ id, label, hosts }));
  }
}
