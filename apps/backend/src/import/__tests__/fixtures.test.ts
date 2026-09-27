import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { buildContext, ImporterRegistry } from "../index.js";
import { summarise, type FixtureExpectation } from "./fixture-summary.js";

const root = path.join(import.meta.dirname, "fixtures");

interface Fixture {
  name: string;
  dir: string;
  expected: FixtureExpectation;
}

function loadFixtures(): Fixture[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((site) => site.isDirectory())
    .flatMap((site) =>
      readdirSync(path.join(root, site.name), { withFileTypes: true })
        .filter((page) => page.isDirectory())
        .map((page) => {
          const dir = path.join(root, site.name, page.name);
          const expected = JSON.parse(
            readFileSync(path.join(dir, "expected.json"), "utf8"),
          ) as FixtureExpectation;
          return { name: `${site.name}/${page.name}`, dir, expected };
        }),
    );
}

function readApi(dir: string) {
  const apiDir = path.join(dir, "api");
  if (!existsSync(apiDir)) return [];
  return readdirSync(apiDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const { url, body } = JSON.parse(
        readFileSync(path.join(apiDir, file), "utf8"),
      ) as {
        url: string;
        body: string;
      };
      return { url, body };
    });
}

const fixtures = loadFixtures();

describe.skipIf(fixtures.length === 0)("recorded pages", () => {
  it.each(fixtures.map((f) => [f.name, f] as const))("%s", (_, fixture) => {
    const { expected } = fixture;
    expect(expected.reviewed, "expected.json has not been reviewed").toBe(true);

    const ctx = buildContext({
      url: expected.url,
      html: readFileSync(path.join(fixture.dir, "page.html"), "utf8"),
      api: readApi(fixture.dir),
      currentYear: expected.currentYear,
    });
    const importer = new ImporterRegistry().forUrl(ctx.url);
    expect(importer.id).toBe(expected.importer);

    const actual = summarise(importer.extract(ctx));
    for (const [field, value] of Object.entries(expected.fields)) {
      expect(actual[field as keyof typeof actual], field).toEqual(value);
    }
  });
});
