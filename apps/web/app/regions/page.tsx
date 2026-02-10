"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Region } from "@cellarboss/types";
import { getRegions, deleteRegion } from "@/lib/api/regions";
import { DataTable } from "@/components/datatable/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { getCountries } from "@/lib/api/countries";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function RegionsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Region): Promise<void> {
    router.push(`/regions/${row.id}/edit`);
  }

  async function handleDelete(row: Region): Promise<boolean> {
    console.log("Delete row:", row);

    try {
      if (!row.id) throw new Error("Invalid region ID");

      var delResult = await deleteRegion(row.id);
      if (!delResult.ok) {
        throw new Error("Error deleting region: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['regions'] })

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const regionQuery = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const countryQuery = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  })

  if (regionQuery.isLoading || countryQuery.isLoading) return <LoadingCard />;

  if (!regionQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + regionQuery.data?.error.message} />;
  if (!countryQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + countryQuery.data?.error.message} />;
  if (regionQuery.error) return <ErrorCard message={`An error occurred: ` + (regionQuery.error as any).message} />;
  if (countryQuery.error) return <ErrorCard message={`An error occurred: ` + (countryQuery.error as any).message} />;

  var regionsList = regionQuery.data.data;
  var countryList = countryQuery.data.data;


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
        var country = countryList.filter(country => country.id === row.original.countryId)[0]
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