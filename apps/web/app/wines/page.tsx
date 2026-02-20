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
import { queryGate } from "@/lib/functions/query-gate";
import WineDetailRow from "@/components/datatable/detail/WineDetailRow";
import { WINE_TYPE_COLORS, WINE_TYPE_LABELS } from "@/lib/constants/wine-colouring";
import { VintageButton } from "@/components/buttons/VintageButton";

export default function WinesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Wine): Promise<void> {
    router.push(`/wines/${row.id}/edit`);
  }

  async function handleDelete(row: Wine): Promise<boolean> {
    const delResult = await deleteWine(row.id);
    if (!delResult.ok) throw new Error("Error deleting wine: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["wines"] });
    return true;
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
      cell: ({ row }) => (
        <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
          <a href={"/wines/" + row.original.id}>{row.original.name}</a>
          <span
            className={`inline-block w-3 h-3 rounded-full shrink-0 ${WINE_TYPE_COLORS[row.original.type]}`}
            title={WINE_TYPE_LABELS[row.original.type]}
          />
        </div>
      ),
    },
    {
      accessorKey: 'winemaker',
      header: 'Winemaker',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        const winemaker = winemakerList.find(w => w.id === row.original.wineMakerId);
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
        const region = regionList.find(r => r.id === row.original.regionId);
        const country = region ? countryList.find(c => c.id === region!.countryId) : undefined;
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
            <VintageButton onClick={() => router.push(`/vintages/new?wineId=${row.original.id}`)} />
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
