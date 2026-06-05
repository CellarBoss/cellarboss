import { describe, it, expect } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getDefaultColumnVisibility,
  isColumnVisibilityPreference,
  mergeColumnVisibility,
  toPersistedColumnVisibility,
} from "@/components/datatable/utils/columnVisibility";

type Row = {
  id: number;
  name: string;
  region: string;
  country: string;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "id",
    header: "ID",
    meta: { defaultVisible: false, isHideable: false },
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: { isHideable: false },
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "country",
    header: "Country",
    meta: { defaultVisible: false },
  },
  {
    id: "filterOnly",
    header: "",
    accessorFn: (row) => row.id,
    meta: { isSuppressed: true, defaultVisible: false },
  },
];

describe("column visibility helpers", () => {
  it("builds defaults from column metadata", () => {
    expect(getDefaultColumnVisibility(columns)).toEqual({
      id: false,
      country: false,
      filterOnly: false,
    });
  });

  it("merges saved preferences without allowing fixed or suppressed overrides", () => {
    expect(
      mergeColumnVisibility(columns, {
        id: true,
        name: false,
        region: false,
        country: true,
        filterOnly: true,
        unknown: false,
      }),
    ).toEqual({
      id: false,
      region: false,
      country: true,
      filterOnly: false,
    });
  });

  it("persists only user-hideable data columns", () => {
    expect(
      toPersistedColumnVisibility(columns, {
        name: false,
        region: false,
        country: true,
        filterOnly: true,
      }),
    ).toEqual({
      region: false,
      country: true,
    });
  });

  it("validates preference payload shape", () => {
    expect(isColumnVisibilityPreference({ name: true })).toBe(true);
    expect(isColumnVisibilityPreference({ name: "true" })).toBe(false);
    expect(isColumnVisibilityPreference(["name"])).toBe(false);
  });
});
