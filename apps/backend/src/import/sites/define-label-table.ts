import { BaseImporter, type RequiredField } from "../base-importer.js";
import { fromSite, labelTableReader } from "../extractors/index.js";
import type { ImportContext, RawField, RawWine, Strategy } from "../types.js";

export interface LabelTableImporterConfig {
  id: string;
  label: string;
  hosts: string[];
  /** CSS selector for the facts section; the whole page when omitted. */
  container?: string;
  /** The site's own labels, mapped to fields. */
  labels: Record<string, RawField>;
  strategies?: Strategy[];
  required?: RequiredField[];
}

/**
 * Builds an adapter for a site that lists its facts as label/value pairs, so
 * most retailers need only a short config file and a fixture.
 */
export function defineLabelTableImporter(
  config: LabelTableImporterConfig,
): BaseImporter {
  return new (class extends BaseImporter {
    readonly id = config.id;
    readonly label = config.label;
    readonly hosts = config.hosts;
    override readonly strategies = config.strategies ?? ["http"];
    override readonly required = config.required ?? ["name", "winemaker"];

    protected override extractSite({ $ }: ImportContext): RawWine {
      const read = labelTableReader($, config.container);
      const result: RawWine = {};
      for (const [label, field] of Object.entries(config.labels)) {
        if (!result[field]) result[field] = fromSite(read(label));
      }
      return result;
    }
  })();
}
