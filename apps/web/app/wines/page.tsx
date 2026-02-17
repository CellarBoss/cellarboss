"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Wine } from "@cellarboss/types";
import { getCountries } from "@/lib/api/countries";
import { getWines, deleteWine } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { DataTable } from "@/components/datatable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";
import WineDetailRow from "@/components/datatable/detail/WineDetailRow";

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

  const wineQuery = useApiQuery({ queryKey: ["wines"], queryFn: getWines });
  const winemakerQuery = useApiQuery({ queryKey: ["winemakers"], queryFn: getWinemakers });
  const regionQuery = useApiQuery({ queryKey: ["regions"], queryFn: getRegions });
  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(wineQuery, winemakerQuery, regionQuery, countryQuery);
  if (!result.ready) return result.gate;

  const [winesList, winemakerList, regionList, countryList] = result.data;

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
        return (
          <span><a href={"/winemakers/" + winemaker.id}>{winemaker.name}</a></span>
        );
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
        var country = region ? countryList.find(c => c.id === region!.countryId) : undefined;
        return (
          <span>
            {
              region ? <a href={"/regions/" + region.id}>{region.name}</a> : <span>-</span>
            }
            {
              country ? <span>,&nbsp;<a href={"/countries/" + country.id}>{country.name}</a></span> : null
            }
          </span>
        );
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
        renderDetail={(wine) => {
          return (
            <WineDetailRow wine={wine} />
          );
        }}
        buttons={[
          <AddButton onClick={async () => router.push(`/wines/new`)} subject="Wine" key="add" />
        ]}
      />
    </section>
  );
}
