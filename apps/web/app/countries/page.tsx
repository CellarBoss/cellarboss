"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getCountries, deleteCountry } from "@/lib/api/countries";
import { DataTable } from "@/components/datatable/DataTable";
import type { Country } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function CountriesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Country): Promise<void> {
    router.push(`/countries/${row.id}/edit`);
  }

  async function handleDelete(row: Country): Promise<boolean> {
    const delResult = await deleteCountry(row.id);
    if (!delResult.ok) throw new Error("Error deleting country: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["countries"] });
    return true;
  }

  async function handleBulkDelete(rows: Country[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteCountry(row.id);
      if (!result.ok) throw new Error("Error deleting country: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["countries"] });
  }

  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(countryQuery);
  if (!result.ready) return result.gate;

  const [countriesList] = result.data;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Country Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: Country } }) => {
        return (
          <a href={"/countries/" + row.original.id}>{row.original.name}</a>
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
      cell: ({ row }: { row: { original: Country } }) => {
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
      <PageHeader title="Countries" />
      <DataTable<Country>
        data={countriesList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        onBulkDelete={handleBulkDelete}
        buttons={[
          <AddButton onClick={async () => router.push(`/countries/new`)} subject="Country" key="add" />
        ]}
      />
    </section>
  );
}
