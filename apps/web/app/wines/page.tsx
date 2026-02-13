"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Wine, WineGrape } from "@cellarboss/types";
import { getWines, deleteWine } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { DataTable } from "@/components/datatable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function WinesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Wine): Promise<void> {
    router.push(`/wines/${row.id}/edit`);
  }

  async function handleDelete(row: Wine): Promise<boolean> {
    try {
      if (!row.id) throw new Error("Invalid wine ID");

      var delResult = await deleteWine(row.id);
      if (!delResult.ok) {
        throw new Error("Error deleting wine: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['wines'] });
      queryClient.invalidateQueries({ queryKey: ['winegrapes'] });

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const wineQuery = useQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const winemakerQuery = useQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });

  const regionQuery = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const grapeQuery = useQuery({
    queryKey: ["grapes"],
    queryFn: getGrapes,
  });

  const wineGrapeQuery = useQuery({
    queryKey: ["winegrapes"],
    queryFn: getWineGrapes,
  });

  if (wineQuery.isLoading || winemakerQuery.isLoading || regionQuery.isLoading || grapeQuery.isLoading || wineGrapeQuery.isLoading) {
    return <LoadingCard />;
  }

  if (!wineQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + wineQuery.data?.error.message} />;
  if (!winemakerQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + winemakerQuery.data?.error.message} />;
  if (!regionQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + regionQuery.data?.error.message} />;
  if (!grapeQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + grapeQuery.data?.error.message} />;
  if (!wineGrapeQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + wineGrapeQuery.data?.error.message} />;

  var winesList = wineQuery.data.data;
  var winemakerList = winemakerQuery.data.data;
  var regionList = regionQuery.data.data;
  var grapeList = grapeQuery.data.data;
  var wineGrapeList = wineGrapeQuery.data.data;

  function getGrapeNamesForWine(wineId: number): string {
    const grapeIds = wineGrapeList
      .filter((wg: WineGrape) => wg.wineId === wineId)
      .map((wg: WineGrape) => wg.grapeId);
    return grapeList
      .filter((g) => grapeIds.includes(g.id))
      .map((g) => g.name)
      .join(", ");
  }

  const columns: ColumnDef<Wine>[] = [
    {
      accessorKey: 'name',
      header: 'Wine Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <a href={"/wines/" + row.original.id}>{row.original.name}</a>
        )
      }
    },
    {
      accessorKey: 'winemaker',
      header: 'Winemaker',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        var winemaker = winemakerList.find(w => w.id === row.original.wineMakerId);
        if (!winemaker) return <span>-</span>;
        return <span>{winemaker.name}</span>;
      }
    },
    {
      accessorKey: 'region',
      header: 'Region',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        if (!row.original.regionId) return <span>-</span>;
        var region = regionList.find(r => r.id === row.original.regionId);
        if (!region) return <span>-</span>;
        return <span>{region.name}</span>;
      }
    },
    {
      accessorKey: 'grapes',
      header: 'Grapes',
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        const names = getGrapeNamesForWine(row.original.id);
        return <span>{names || "-"}</span>;
      }
    },
    {
      accessorKey: 'options',
      id: 'options',
      header: '',
      minSize: 100,
      maxSize: 100,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1 justify-center mx-5">
            <EditButton
              onEdit={() => handleEdit(row.original)}
            />
            <DeleteButton
              itemDescription={row.original.name}
              onDelete={() => handleDelete(row.original)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <section>
      <PageHeader title="Wines" />
      <DataTable<Wine>
        data={winesList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        buttons={[
          <AddButton onClick={async () => router.push(`/wines/new`)} subject="Wine" key="add" />
        ]}
      />
    </section>
  );
}
