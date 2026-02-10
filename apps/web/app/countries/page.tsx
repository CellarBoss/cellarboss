"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCountries } from "@/lib/api/countries";
import { DataTable } from "@/components/datatable/DataTable";
import type { Country } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { deleteCountry } from "@/lib/api/countries";
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function CountriesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Country): Promise<void> {
    router.push(`/countries/${row.id}/edit`);
  }

  async function handleDelete(row: Country): Promise<boolean> {
    console.log("Delete row:", row);

    try {
      if (!row.id) throw new Error("Invalid country ID");

      var delResult = await deleteCountry(row.id);
      if (!delResult.ok) {
        throw new Error("Error deleting country: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['countries'] })

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  if (isLoading) return <LoadingCard />;
  if (!data?.ok) return <ErrorCard message={`Error receiving data: ` + data?.error.message } />;
  if (error) return <ErrorCard message={`An error occurred: ` +  error.message } />;

  var countriesList = data.data;

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
        buttons={[
          <AddButton onClick={async () => router.push(`/countries/new`)} subject="Country" key="add" />
        ]}
      />
    </section>
  );
}