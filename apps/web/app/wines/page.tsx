"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Wine } from "@cellarboss/types";
import { getCountries } from "@/lib/api/countries";
import { getWines, deleteWine, updateWine } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { DataTable, type BulkEditField } from "@/components/datatable/DataTable";
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
import { WINE_TYPES } from "@cellarboss/validators/constants";

function formatWineType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

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

  async function handleBulkDelete(rows: Wine[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteWine(row.id);
      if (!result.ok) throw new Error("Error deleting wine: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["wines"] });
  }

  async function handleBulkEdit(rows: Wine[], partial: Record<string, any>): Promise<void> {
    for (const row of rows) {
      const result = await updateWine({
        ...row,
        ...(partial.type ? { type: partial.type } : {}),
        ...(partial.wineMakerId ? { wineMakerId: Number(partial.wineMakerId) } : {}),
        ...(partial.regionId ? { regionId: Number(partial.regionId) } : {}),
      });
      if (!result.ok) throw new Error("Error updating wine: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["wines"] });
  }

  const wineQuery = useApiQuery({ queryKey: ["wines"], queryFn: getWines });
  const winemakerQuery = useApiQuery({ queryKey: ["winemakers"], queryFn: getWinemakers });
  const regionQuery = useApiQuery({ queryKey: ["regions"], queryFn: getRegions });
  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(wineQuery, winemakerQuery, regionQuery, countryQuery);
  if (!result.ready) return result.gate;

  const [winesList, winemakerList, regionList, countryList] = result.data;

  const bulkEditFields: BulkEditField<Wine>[] = [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: WINE_TYPES.map((t) => ({ value: t, label: formatWineType(t) })),
    },
    {
      key: "wineMakerId",
      label: "Winemaker",
      type: "select",
      options: winemakerList.map((w) => ({ value: String(w.id), label: w.name })),
    },
    {
      key: "regionId",
      label: "Region",
      type: "select",
      options: regionList.map((r) => {
        const country = countryList.find((c) => c.id === r.countryId);
        return { value: String(r.id), label: country ? `${r.name}, ${country.name}` : r.name };
      }),
    },
  ];

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
      size: 100,
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
        onBulkDelete={handleBulkDelete}
        bulkEditFields={bulkEditFields}
        onBulkEdit={handleBulkEdit}
        renderDetail={(wine) => (
          <WineDetailRow wine={wine} />
        )}
        buttons={[
          <AddButton onClick={async () => router.push(`/wines/new`)} subject="Wine" key="add" />
        ]}
      />
    </section>
  );
}
