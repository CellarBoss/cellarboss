"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Region } from "@cellarboss/types";
import { getRegions, deleteRegion } from "@/lib/api/regions";
import { DataTable } from "@/components/datatable/DataTable";
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

  const regionQuery = useApiQuery({ queryKey: ["regions"], queryFn: getRegions });
  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(regionQuery, countryQuery);
  if (!result.ready) return result.gate;

  const [regionsList, countryList] = result.data;


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
      accessorKey: 'country',
      header: 'Country',
      enableColumnFolder: false,
      enableSorting: true,
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
      minSize: 100,
      maxSize: 100,
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
        buttons={[
          <AddButton onClick={async () => router.push(`/regions/new`)} subject="Region" key="add" />
        ]}
      />
    </section>
  );
}