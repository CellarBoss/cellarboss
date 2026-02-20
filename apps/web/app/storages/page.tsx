"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Storage } from "@cellarboss/types";
import { buildTree, TreeNode } from "@/lib/functions/tree";
import { getStorages, deleteStorage } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { DataTable } from "@/components/datatable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function StoragesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Storage): Promise<void> {
    router.push(`/storages/${row.id}/edit`);
  }

  async function handleDelete(row: Storage): Promise<boolean> {
    const delResult = await deleteStorage(row.id);
    if (!delResult.ok) throw new Error("Error deleting storage: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["storages"] });
    return true;
  }

  const storageQuery = useApiQuery({ queryKey: ["storages"], queryFn: getStorages });
  const locationQuery = useApiQuery({ queryKey: ["locations"], queryFn: getLocations });

  const result = queryGate(storageQuery, locationQuery);
  if (!result.ready) return result.gate;

  const [storagesList, locationList] = result.data;
  const treeData = buildTree(storagesList, "parent");

  const columns: ColumnDef<TreeNode<Storage>>[] = [
    {
      accessorKey: 'name',
      header: 'Storage Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
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
      cell: ({ row }) => {
        if (!row.original.locationId) return <span>-</span>;
        var location = locationList.filter(l => l.id === row.original.locationId)[0];
        if (!location) return <span>-</span>;
        return (
          <a href={"/locations/" + location.id}>{location.name}</a>
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
      <PageHeader title="Storages" />
      <DataTable<TreeNode<Storage>>
        data={treeData}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        getSubRows={(row) => row.subRows}
        defaultExpanded={true}
        buttons={[
          <AddButton onClick={async () => router.push(`/storages/new`)} subject="Storage" key="add" />
        ]}
      />
    </section>
  );
}
