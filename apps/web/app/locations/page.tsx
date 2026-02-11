"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocations } from "@/lib/api/locations";
import { DataTable } from "@/components/datatable/DataTable";
import type { Location } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { deleteLocation } from "@/lib/api/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Location): Promise<void> {
    router.push(`/locations/${row.id}/edit`);
  }

  async function handleDelete(row: Location): Promise<boolean> {
    console.log("Delete row:", row);

    try {
      if (!row.id) throw new Error("Invalid location ID");

      var delResult = await deleteLocation(row.id);
      if (!delResult.ok) {
        throw new Error("Error deleting location: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['locations'] })

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  if (isLoading) return <LoadingCard />;
  if (!data?.ok) return <ErrorCard message={`Error receiving data: ` + data?.error.message } />;
  if (error) return <ErrorCard message={`An error occurred: ` +  error.message } />;

  var locationsList = data.data;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Location Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: Location } }) => {
        return (
          <a href={"/locations/" + row.original.id}>{row.original.name}</a>
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
      cell: ({ row }: { row: { original: Location } }) => {
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
      <PageHeader title="Locations" />
      <DataTable<Location>
        data={locationsList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        buttons={[
          <AddButton onClick={async () => router.push(`/locations/new`)} subject="Location" key="add" />
        ]}
      />
    </section>
  );
}
