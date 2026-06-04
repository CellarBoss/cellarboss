import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANGUAGE,
  getLanguageLabel,
  resolveLanguage,
  translate,
} from "../i18n";

describe("resolveLanguage", () => {
  it("returns exact supported languages", () => {
    expect(resolveLanguage("es")).toBe("es");
    expect(resolveLanguage("fr")).toBe("fr");
  });

  it("normalizes regional language tags", () => {
    expect(resolveLanguage("es-MX")).toBe("es");
    expect(resolveLanguage("fr-CA")).toBe("fr");
  });

  it("falls back to the default language for unsupported values", () => {
    expect(resolveLanguage("de")).toBe(DEFAULT_LANGUAGE);
    expect(resolveLanguage(null)).toBe(DEFAULT_LANGUAGE);
  });
});

describe("translate", () => {
  it("returns translated labels", () => {
    expect(translate("es", "nav.wines")).toBe("Vinos");
    expect(translate("fr", "settings.language")).toBe("Langue");
  });
});

describe("getLanguageLabel", () => {
  it("returns display labels for supported languages", () => {
    expect(getLanguageLabel("en")).toBe("English");
    expect(getLanguageLabel("es")).toBe("Español");
  });
});
