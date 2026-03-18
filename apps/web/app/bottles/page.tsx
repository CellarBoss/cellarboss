"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getBottles, deleteBottle, updateBottle } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getStorages } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import {
  buildTree,
  buildHierarchicalOptions,
  sortHierarchicalOptions,
} from "@/lib/functions/tree";
import {
  getVintageName,
  buildDescendantsMap,
  buildWineGroupedOptions,
} from "@/lib/functions/bottles";
import {
  DataTable,
  type BulkEditField,
  type FilterDef,
  FilterType,
} from "@/components/datatable/components/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { MoveBottleButton } from "@/components/buttons/MoveBottleButton";
import { ChangeStatusButton } from "@/components/buttons/ChangeStatusButton";
import { AddButton } from "@/components/buttons/AddButton";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSettings } from "@/hooks/use-settings";
import { queryGate } from "@/lib/functions/query-gate";
import {
  formatPrice,
  formatStatus,
  formatBottleSize,
  formatDate,
  formatDrinkingStatus,
  formatWineType,
} from "@/lib/functions/format";
import type { Bottle, Wine, WineMaker } from "@cellarboss/types";
import {
  BOTTLE_STATUSES,
  BOTTLE_SIZES,
  WINE_TYPES,
} from "@cellarboss/validators/constants";
import { Row } from "@tanstack/react-table";
import { compareAsc } from "date-fns";
import { DrinkingWindowDisplay } from "@/components/vintage/DrinkingWindowDisplay";
import { StorageHierarchyDisplay } from "@/components/storage/StorageHierarchyDisplay";
import { VintageDisplay } from "@/components/wine/VintageDisplay";
import { BottleSizeIcon } from "@/components/bottles/BottleSizeIcon";
import { ViewButton } from "@/components/buttons/ViewButton";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";

export default function BottlesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const bottleQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
  });
  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: getVintages,
  });
  const wineQuery = useApiQuery({ queryKey: ["wines"], queryFn: getWines });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });
  const storageQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });
  const locationQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const settingsQuery = useSettings();

  const result = queryGate([
    bottleQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
    storageQuery,
    locationQuery,
    settingsQuery,
    regionQuery,
    countryQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    bottles,
    vintages,
    wines,
    winemakers,
    storages,
    locations,
    settings,
    regions,
    countries,
  ] = result.data;
  const currency = settings.get("currency") as string | undefined;
  const dateFormat = settings.get("date") as string | undefined;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w: Wine) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm: WineMaker) => [wm.id, wm]));
  const locationMap = new Map(locations.map((l) => [l.id, l.name]));
  const storageMap = new Map(storages.map((s) => [s.id, s]));

  // Build hierarchical storage options for filters and bulk edit
  const treeData = buildTree(storages, "parent");
  const descendantsMap = buildDescendantsMap(storages);

  async function handleDelete(row: Bottle): Promise<boolean> {
    const delResult = await deleteBottle(row.id);
    if (!delResult.ok)
      throw new Error("Error deleting bottle: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
    return true;
  }

  async function handleMove(
    bottle: Bottle,
    newStorageId: number | null,
  ): Promise<void> {
    const result = await updateBottle({ ...bottle, storageId: newStorageId });
    if (!result.ok) throw new Error(result.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  async function handleChangeStatus(
    bottle: Bottle,
    newStatus: Bottle["status"],
  ): Promise<void> {
    const result = await updateBottle({ ...bottle, status: newStatus });
    if (!result.ok) throw new Error(result.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  async function handleBulkDelete(rows: Bottle[]): Promise<void> {
    const errors: string[] = [];
    try {
      for (const row of rows) {
        const result = await deleteBottle(row.id);
        if (!result.ok) errors.push(result.error.message);
      }
    } finally {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    }
    if (errors.length)
      throw new Error("Error deleting bottle: " + errors.join(", "));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleBulkEdit(
    rows: Bottle[],
    partial: Record<string, any>,
  ): Promise<void> {
    for (const row of rows) {
      const result = await updateBottle({
        ...row,
        ...(partial.status ? { status: partial.status } : {}),
        ...(partial.storageId ? { storageId: Number(partial.storageId) } : {}),
      });
      if (!result.ok)
        throw new Error("Error updating bottle: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  const bulkEditFields: BulkEditField<Bottle>[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: BOTTLE_STATUSES.map((s) => ({
        value: s,
        label: formatStatus(s),
      })),
    },
    {
      key: "storageId",
      label: "Storage",
      type: "select",
      options: sortHierarchicalOptions(buildHierarchicalOptions(treeData)),
    },
  ];

  const drinkingWindowOptions = [
    { value: "wait", label: "Too Young" },
    { value: "drinkable", label: "Ready to Drink" },
    { value: "past", label: "Past Prime" },
    { value: "unknown", label: "Unknown Window" },
  ];

  const filters: FilterDef[] = [
    {
      type: FilterType.GroupedMultiSelect,
      columnId: "wineId",
      label: "Wine",
      urlParamName: "wineId",
      options: buildWineGroupedOptions(wines, winemakers),
    },
    {
      type: FilterType.Range,
      columnId: "year",
      label: "Year",
      urlParamName: "year",
    },
    {
      type: FilterType.MultiSelect,
      columnId: "type",
      label: "Type",
      urlParamName: "type",
      options: WINE_TYPES.map((s) => ({
        value: s,
        label: formatWineType(s),
      })),
    },
    {
      type: FilterType.MultiSelect,
      columnId: "drinkingStatus",
      label: "Drinking Window",
      urlParamName: "drinkingWindow",
      options: drinkingWindowOptions,
    },
    {
      type: FilterType.MultiSelect,
      columnId: "status",
      label: "Status",
      urlParamName: "status",
      options: BOTTLE_STATUSES.map((s) => ({
        value: s,
        label: formatStatus(s),
      })),
    },
    {
      type: FilterType.MultiSelect,
      columnId: "size",
      label: "Size",
      urlParamName: "size",
      options: BOTTLE_SIZES.map((s) => ({
        value: s,
        label: formatBottleSize(s),
      })),
      sort: (opts) => opts, // Display in natural order defined by BOTTLE_SIZES, not alphabetical
    },
    {
      type: FilterType.MultiSelect,
      columnId: "storageId",
      label: "Storage",
      urlParamName: "storageId",
      options: buildHierarchicalOptions(treeData),
      sort: sortHierarchicalOptions,
    },
    {
      type: FilterType.Range,
      columnId: "purchasePrice",
      label: "Price",
      urlParamName: "price",
    },
    {
      type: FilterType.MultiSelect,
      columnId: "locationId",
      label: "Location",
      urlParamName: "locationId",
      options: locations.map((l) => ({ value: String(l.id), label: l.name })),
    },
    {
      type: FilterType.MultiSelect,
      columnId: "countryId",
      label: "Country",
      urlParamName: "countryId",
      options: countries.map((c) => ({ value: String(c.id), label: c.name })),
    },
  ];

  const columns = [
    {
      id: "vintage",
      header: "Wine",
      enableSorting: true,
      enableColumnFilter: true,
      accessorFn: (row: Bottle) =>
        getVintageName(row.vintageId, vintageMap, wineMap, winemakerMap),
      cell: ({ row }: { row: { original: Bottle } }) => {
        const vintage = vintageMap.get(row.original.vintageId);
        const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
        const winemaker = wine ? winemakerMap.get(wine.wineMakerId) : undefined;
        return (
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <VintageDisplay
              vintage={vintage}
              wine={wine}
              winemaker={winemaker}
            />
            <BottleSizeIcon
              size={row.original.size}
              wineType={wine?.type ?? "red"}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "drinkingWindow",
      header: "Drinking Window",
      enableSorting: false,
      cell: ({ row }: { row: { original: Bottle } }) => {
        const vintage = vintageMap.get(row.original.vintageId);
        if (!vintage) return "Unknown";
        return (
          <DrinkingWindowDisplay
            drinkFrom={vintage.drinkFrom}
            drinkUntil={vintage.drinkUntil}
          />
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      enableSorting: true,
      sortingFn: (rowA: Row<Bottle>, rowB: Row<Bottle>) => {
        return compareAsc(
          rowA.original.purchaseDate,
          rowB.original.purchaseDate,
        );
      },
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span>
          {formatDate(row.original.purchaseDate, dateFormat as string)}
        </span>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: "Price",
      enableSorting: true,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span>
          {formatPrice(
            row.original.purchasePrice,
            (currency as string) || "USD",
          )}
        </span>
      ),
    },
    {
      accessorKey: "storageId",
      id: "storageId",
      header: "Storage",
      enableSorting: true,
      enableColumnFilter: true,
      accessorFn: (row: Bottle) => String(row.storageId || ""),
      filterFn: (
        row: Row<Bottle>,
        _columnId: string,
        filterValue: string[],
      ) => {
        if (!filterValue || filterValue.length === 0) return true;
        const storageId = row.original.storageId;
        if (!storageId) return false;
        // Check if this bottle's storage is a descendant of any selected filter value
        return filterValue.some((selectedId) =>
          descendantsMap.get(Number(selectedId))?.has(storageId),
        );
      },
      cell: ({ row }: { row: { original: Bottle } }) => (
        <StorageHierarchyDisplay storageId={row.original.storageId} />
      ),
    },
    {
      accessorKey: "locationId",
      id: "locationId",
      header: "Location",
      enableSorting: false,
      enableColumnFilter: true,
      accessorFn: (row: Bottle) =>
        String(storageMap.get(row.storageId || 0)?.locationId || ""),
      cell: ({ row }: { row: { original: Bottle } }) => {
        const locationId = storageMap.get(
          row.original.storageId || 0,
        )?.locationId;
        if (!locationId) return "—";
        return locationMap.get(locationId) || "Unknown";
      },
    },
    {
      accessorKey: "size",
      header: "Size",
      enableSorting: true,
      enableColumnFilter: true,
      meta: { hidden: true },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }: { row: { original: Bottle } }) =>
        formatStatus(row.original.status),
    },
    {
      id: "options",
      header: "",
      size: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <div className="flex gap-1 justify-center mx-5">
          <ViewButton
            onClick={async () => router.push(`/bottles/${row.original.id}`)}
          />
          <MoveBottleButton
            storages={storages}
            currentStorageId={row.original.storageId}
            onMove={(id) => handleMove(row.original, id)}
          />
          <ChangeStatusButton
            currentStatus={row.original.status}
            onChangeStatus={(s) => handleChangeStatus(row.original, s)}
          />
          <EditButton
            onEdit={async () => router.push(`/bottles/${row.original.id}/edit`)}
          />
          <DeleteButton
            itemDescription={getVintageName(
              row.original.vintageId,
              vintageMap,
              wineMap,
              winemakerMap,
            )}
            onDelete={() => handleDelete(row.original)}
          />
        </div>
      ),
    },
    {
      // Hidden column used for filtering by wine
      id: "wineId",
      header: "",
      enableColumnFilter: true,
      enableSorting: false,
      meta: { hidden: true },
      accessorFn: (row: Bottle) =>
        String(vintageMap.get(row.vintageId)?.wineId ?? ""),
    },
    {
      // Hidden column used for filtering by year
      id: "year",
      header: "",
      enableColumnFilter: true,
      enableSorting: false,
      meta: { hidden: true },
      accessorFn: (row: Bottle) => vintageMap.get(row.vintageId)?.year ?? 0,
    },
    {
      // Hidden column used for filtering by bottle type
      id: "type",
      header: "",
      enableColumnFilter: true,
      enableSorting: false,
      meta: { hidden: true },
      accessorFn: (row: Bottle) =>
        wineMap.get(vintageMap.get(row.vintageId)?.wineId ?? 0)?.type ?? "",
    },
    {
      // Hidden column used for filtering by drinking status
      id: "drinkingStatus",
      header: "",
      enableColumnFilter: true,
      enableSorting: false,
      meta: { hidden: true },
      accessorFn: (row: Bottle) => {
        const vintage = vintageMap.get(row.vintageId);
        if (!vintage) return "unknown";
        return formatDrinkingStatus(
          vintage.drinkFrom,
          vintage.drinkUntil,
          new Date().getFullYear(),
        );
      },
    },
    {
      // Hidden column used for filtering by country
      id: "countryId",
      header: "",
      enableColumnFilter: true,
      enableSorting: false,
      meta: { hidden: true },
      accessorFn: (row: Bottle) => {
        const vintage = vintageMap.get(row.vintageId);
        if (!vintage) return "";
        const wine = wineMap.get(vintage.wineId);
        if (!wine) return "";
        const region = regions.find((r) => r.id === wine.regionId);
        if (!region) return "";
        const country = countries.find((c) => c.id === region.countryId);
        return country ? String(country.id) : "";
      },
    },
  ];

  return (
    <section>
      <PageHeader title="Bottles" />
      <DataTable<Bottle>
        data={bottles}
        columns={columns}
        filterColumnName="vintage"
        defaultSortColumn="purchaseDate"
        filters={filters}
        onBulkDelete={handleBulkDelete}
        bulkEditFields={bulkEditFields}
        onBulkEdit={handleBulkEdit}
        buttons={[
          <AddButton
            onClick={async () => router.push("/bottles/new")}
            subject="Bottle"
            key="add"
          />,
        ]}
      />
    </section>
  );
}
