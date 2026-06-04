import { describe, expect, it } from "vitest";
import { getSettingFields } from "../settings";

describe("getSettingFields", () => {
  it("uses language options for the language setting", () => {
    const fields = getSettingFields("language");
    const valueField = fields.find((field) => field.key === "value");

    expect(valueField).toMatchObject({
      type: "fixed-list",
      label: "Language",
    });
    expect("options" in valueField! ? valueField.options : []).toEqual([
      { value: "en", label: "English" },
      { value: "es", label: "Español" },
      { value: "fr", label: "Français" },
    ]);
  });

  it("keeps free-text editing for other settings", () => {
    const fields = getSettingFields("currency");
    const valueField = fields.find((field) => field.key === "value");

    expect(valueField).toMatchObject({
      type: "text",
      label: "Value",
    });
  });
});
