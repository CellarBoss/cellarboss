"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Region } from "@cellarboss/types";
import { getRegions, deleteRegion, updateRegion } from "@/lib/api/regions";
import { DataTable, type BulkEditField, type FilterDef } from "@/components/datatable/components/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { getCountries } from "@/lib/api/countries";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function RegionsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Region): Promise<void> {
    router.push(`/regions/${row.id}/edit`);
  }

  async function handleDelete(row: Region): Promise<boolean> {
    const delResult = await deleteRegion(row.id);
    if (!delResult.ok) throw new Error("Error deleting region: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["regions"] });
    return true;
  }

  async function handleBulkDelete(rows: Region[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteRegion(row.id);
      if (!result.ok) throw new Error("Error deleting region: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["regions"] });
  }

  async function handleBulkEdit(rows: Region[], partial: Record<string, any>): Promise<void> {
    for (const row of rows) {
      const result = await updateRegion({
        ...row,
        ...(partial.countryId ? { countryId: Number(partial.countryId) } : {}),
      });
      if (!result.ok) throw new Error("Error updating region: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["regions"] });
  }

  const regionQuery = useApiQuery({ queryKey: ["regions"], queryFn: getRegions });
  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(regionQuery, countryQuery);
  if (!result.ready) return result.gate;

  const [regionsList, countryList] = result.data;

  const bulkEditFields: BulkEditField<Region>[] = [
    {
      key: "countryId",
      label: "Country",
      type: "select",
      options: countryList.map((c) => ({ value: String(c.id), label: c.name })),
    },
  ];

  const regionFilters: FilterDef[] = [
    {
      columnId: "countryId",
      label: "Country",
      urlParamName: "countryId",
      options: countryList.map((c) => ({ value: String(c.id), label: c.name })),
    },
  ];

  const columns = [
    {
      accessorKey: 'name',
      header: 'Region Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: Region } }) => {
        return (
          <a href={"/regions/" + row.original.id}>{row.original.name}</a>
        )
      }
    },
    {
      accessorKey: 'countryId',
      id: 'countryId',
      header: 'Country',
      enableColumnFilter: true,
      enableSorting: true,
      accessorFn: (row: Region) => String(row.countryId || ''),
      cell: ({ row }: { row: { original: Region } }) => {
        const country = countryList.filter(country => country.id === row.original.countryId)[0]
        return (
          <a href={"/countries/" + country.id}>{country.name}</a>
        )
      }
    },
    {
      accessorKey: 'options',
      id: 'options',
      header: '',
      size: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: Region } }) => {
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
      <PageHeader title="Regions" />
      <DataTable<Region>
        data={regionsList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        filters={regionFilters}
        onBulkDelete={handleBulkDelete}
        bulkEditFields={bulkEditFields}
        onBulkEdit={handleBulkEdit}
        buttons={[
          <AddButton onClick={async () => router.push(`/regions/new`)} subject="Region" key="add" />
        ]}
      />
    </section>
  );
}
