"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getBottles, deleteBottle, updateBottle } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getStorages } from "@/lib/api/storages";
import { DataTable, type BulkEditField } from "@/components/datatable/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { MoveBottleButton } from "@/components/buttons/MoveBottleButton";
import { ChangeStatusButton } from "@/components/buttons/ChangeStatusButton";
import { AddButton } from "@/components/buttons/AddButton";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { queryGate } from "@/lib/functions/query-gate";
import { formatPrice, formatStatus, formatDate } from "@/lib/functions/format";
import type { Bottle, Vintage, Wine, WineMaker } from "@cellarboss/types";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { BOTTLE_STATUSES } from "@cellarboss/validators/constants";
import { Row } from "@tanstack/react-table";
import { compareAsc } from "date-fns";

function getVintageName(
  vintageId: number,
  vintageMap: Map<number, Vintage>,
  wineMap: Map<number, Wine>,
  winemakerMap: Map<number, string>
): string {
  const vintage = vintageMap.get(vintageId);
  if (!vintage) return "Unknown";
  const wine = wineMap.get(vintage.wineId);
  if (!wine) return `Unknown Wine ${vintage.year ?? "NV"}`;
  const winemakerName = winemakerMap.get(wine.wineMakerId);
  return `${winemakerName ? winemakerName + " - " : ""}${wine.name} ${vintage.year ?? "NV"}`;
}

export default function BottlesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const bottleQuery = useApiQuery({ queryKey: ["bottles"], queryFn: getBottles });
  const vintageQuery = useApiQuery({ queryKey: ["vintages"], queryFn: getVintages });
  const wineQuery = useApiQuery({ queryKey: ["wines"], queryFn: getWines });
  const winemakerQuery = useApiQuery({ queryKey: ["winemakers"], queryFn: getWinemakers });
  const storageQuery = useApiQuery({ queryKey: ["storages"], queryFn: getStorages });
  const { data: currency, isLoading: currencyLoading } = useSetting("currency");
  const { data: dateFormat, isLoading: dateFormatLoading } = useSetting("date");

  const result = queryGate(bottleQuery, vintageQuery, wineQuery, winemakerQuery, storageQuery);
  if (!result.ready) return result.gate;
  if (currencyLoading || dateFormatLoading) return <LoadingCard />;

  const [bottles, vintages, wines, winemakers, storages] = result.data;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w: Wine) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm: WineMaker) => [wm.id, wm.name]));
  const storageMap = new Map(storages.map((s) => [s.id, s.name]));

  async function handleDelete(row: Bottle): Promise<boolean> {
    const delResult = await deleteBottle(row.id);
    if (!delResult.ok) throw new Error("Error deleting bottle: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
    return true;
  }

  async function handleMove(bottle: Bottle, newStorageId: number | null): Promise<void> {
    const result = await updateBottle({ ...bottle, storageId: newStorageId });
    if (!result.ok) throw new Error(result.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  async function handleChangeStatus(bottle: Bottle, newStatus: Bottle["status"]): Promise<void> {
    const result = await updateBottle({ ...bottle, status: newStatus });
    if (!result.ok) throw new Error(result.error.message);
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  async function handleBulkDelete(rows: Bottle[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteBottle(row.id);
      if (!result.ok) throw new Error("Error deleting bottle: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  async function handleBulkEdit(rows: Bottle[], partial: Record<string, any>): Promise<void> {
    for (const row of rows) {
      const result = await updateBottle({
        ...row,
        ...(partial.status ? { status: partial.status } : {}),
        ...(partial.storageId ? { storageId: Number(partial.storageId) } : {}),
      });
      if (!result.ok) throw new Error("Error updating bottle: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["bottles"] });
  }

  const bulkEditFields: BulkEditField<Bottle>[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: BOTTLE_STATUSES.map((s) => ({ value: s, label: formatStatus(s) })),
    },
    {
      key: "storageId",
      label: "Storage",
      type: "select",
      options: storages.map((s) => ({ value: String(s.id), label: s.name })),
    },
  ];

  const columns = [
    {
      id: "vintage",
      header: "Wine / Vintage",
      enableSorting: true,
      enableColumnFilter: true,
      accessorFn: (row: Bottle) => getVintageName(row.vintageId, vintageMap, wineMap, winemakerMap),
      cell: ({ row }: { row: { original: Bottle } }) => (
        <a href={`/bottles/${row.original.id}`}>
          {getVintageName(row.original.vintageId, vintageMap, wineMap, winemakerMap)}
        </a>
      ),
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      enableSorting: true,
      sortingFn: (rowA : Row<Bottle>, rowB: Row<Bottle>, columnId : string) => {
        return compareAsc(rowA.original.purchaseDate, rowB.original.purchaseDate); 
      },
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span>{formatDate(row.original.purchaseDate, (dateFormat as string))}</span>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: "Price",
      enableSorting: true,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span>{formatPrice(row.original.purchasePrice, (currency as string) || "USD")}</span>
      ),
    },
    {
      accessorKey: "storageId",
      header: "Storage",
      enableSorting: true,
      accessorFn: (row: Bottle) =>
        row.storageId ? (storageMap.get(row.storageId) ?? "Unknown") : "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }: { row: { original: Bottle } }) => (formatStatus(row.original.status)),
    },
    {
      id: "options",
      header: "",
      size: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <div className="flex gap-1 justify-center mx-5">
          <MoveBottleButton
            storages={storages}
            currentStorageId={row.original.storageId}
            onMove={(id) => handleMove(row.original, id)}
          />
          <ChangeStatusButton
            currentStatus={row.original.status}
            onChangeStatus={(s) => handleChangeStatus(row.original, s)}
          />
          <EditButton onEdit={async () => router.push(`/bottles/${row.original.id}/edit`)} />
          <DeleteButton
            itemDescription={getVintageName(row.original.vintageId, vintageMap, wineMap, winemakerMap)}
            onDelete={() => handleDelete(row.original)}
          />
        </div>
      ),
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
