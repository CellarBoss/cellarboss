"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Storage } from "@cellarboss/types";
import { getStorages, deleteStorage } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { DataTable } from "@/components/datatable/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function StoragesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Storage): Promise<void> {
    router.push(`/storages/${row.id}/edit`);
  }

  async function handleDelete(row: Storage): Promise<boolean> {
    console.log("Delete row:", row);

    try {
      if (!row.id) throw new Error("Invalid storage ID");

      var delResult = await deleteStorage(row.id);
      if (!delResult.ok) {
        throw new Error("Error deleting storage: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['storages'] })

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const storageQuery = useQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  const locationQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  if (storageQuery.isLoading || locationQuery.isLoading) return <LoadingCard />;

  if (!storageQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + storageQuery.data?.error.message} />;
  if (!locationQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + locationQuery.data?.error.message} />;
  if (storageQuery.error) return <ErrorCard message={`An error occurred: ` + (storageQuery.error as any).message} />;
  if (locationQuery.error) return <ErrorCard message={`An error occurred: ` + (locationQuery.error as any).message} />;

  var storagesList = storageQuery.data.data;
  var locationList = locationQuery.data.data;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Storage Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: Storage } }) => {
        return (
          <a href={"/storages/" + row.original.id}>{row.original.name}</a>
        )
      }
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }: { row: { original: Storage } }) => {
        if (!row.original.locationId) return <span>-</span>;
        var location = locationList.filter(l => l.id === row.original.locationId)[0];
        if (!location) return <span>-</span>;
        return (
          <a href={"/locations/" + location.id}>{location.name}</a>
        )
      }
    },
    {
      accessorKey: 'parent',
      header: 'Parent Storage',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }: { row: { original: Storage } }) => {
        if (!row.original.parent) return <span>-</span>;
        var parentStorage = storagesList.filter(s => s.id === row.original.parent)[0];
        if (!parentStorage) return <span>-</span>;
        return (
          <a href={"/storages/" + parentStorage.id}>{parentStorage.name}</a>
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
      cell: ({ row }: { row: { original: Storage } }) => {
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
      <PageHeader title="Storages" />
      <DataTable<Storage>
        data={storagesList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        buttons={[
          <AddButton onClick={async () => router.push(`/storages/new`)} subject="Storage" key="add" />
        ]}
      />
    </section>
  );
}
