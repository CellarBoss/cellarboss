import { BaseImporter } from "../base-importer.js";

/**
 * The fallback for any site without an adapter. It relies on the generic
 * extractors alone, so pages with good structured data still fill the form.
 */
export class GenericImporter extends BaseImporter {
  readonly id = "generic";
  readonly label = "Other sites";
  readonly hosts: string[] = [];

  override canHandle(): boolean {
    return true;
  }
}
