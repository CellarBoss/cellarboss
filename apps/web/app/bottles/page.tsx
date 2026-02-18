"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getBottles, deleteBottle } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getStorages } from "@/lib/api/storages";
import { DataTable } from "@/components/datatable/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { AddButton } from "@/components/buttons/AddButton";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";
import type { Bottle, Vintage, Wine, WineMaker } from "@cellarboss/types";

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

  const result = queryGate(bottleQuery, vintageQuery, wineQuery, winemakerQuery, storageQuery);
  if (!result.ready) return result.gate;

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
    },
    {
      accessorKey: "purchasePrice",
      header: "Price",
      enableSorting: true,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span>{Number(row.original.purchasePrice).toFixed(2)}</span>
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
      cell: ({ row }: { row: { original: Bottle } }) => (
        <span className="capitalize">{row.original.status.replace(/-/g, " ")}</span>
      ),
    },
    {
      id: "options",
      header: "",
      minSize: 100,
      maxSize: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: Bottle } }) => (
        <div className="flex gap-1 justify-center mx-5">
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
