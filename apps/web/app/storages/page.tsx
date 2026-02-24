"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Storage } from "@cellarboss/types";
import { buildTree, TreeNode } from "@/lib/functions/tree";
import { getStorages, deleteStorage, updateStorage } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { DataTable, type BulkEditField } from "@/components/datatable/components/DataTable";
import { ColumnDef, Row } from "@tanstack/react-table";
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

  async function handleBulkDelete(rows: TreeNode<Storage>[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteStorage(row.id);
      if (!result.ok) throw new Error("Error deleting storage: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["storages"] });
  }

  async function handleBulkEdit(rows: TreeNode<Storage>[], partial: Record<string, any>): Promise<void> {
    for (const row of rows) {
      const { subRows: _, ...storageData } = row;
      const result = await updateStorage({
        ...storageData,
        ...(partial.locationId ? { locationId: Number(partial.locationId) } : {}),
        ...(partial.parent ? { parent: Number(partial.parent) } : {}),
      });
      if (!result.ok) throw new Error("Error updating storage: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["storages"] });
  }

  const storageQuery = useApiQuery({ queryKey: ["storages"], queryFn: getStorages });
  const locationQuery = useApiQuery({ queryKey: ["locations"], queryFn: getLocations });

  const result = queryGate(storageQuery, locationQuery);
  if (!result.ready) return result.gate;

  const [storagesList, locationList] = result.data;
  const treeData = buildTree(storagesList, "parent");

  const bulkEditFields: BulkEditField<Storage>[] = [
    {
      key: "locationId",
      label: "Location",
      type: "select",
      options: locationList.map((l) => ({ value: String(l.id), label: l.name })),
    },
    {
      key: "parent",
      label: "Parent Storage",
      type: "select",
      options: storagesList.map((s) => ({ value: String(s.id), label: s.name })),
    },
  ];

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
      sortingFn: (rowA: Row<TreeNode<Storage>>, rowB: Row<TreeNode<Storage>>) => {
        const locationA = locationList.find(l => l.id === rowA.original.locationId);
        const locationB = locationList.find(l => l.id === rowB.original.locationId);
        const nameA = locationA?.name ?? '';
        const nameB = locationB?.name ?? '';
        return nameA.localeCompare(nameB);
      },
      cell: ({ row }) => {
        if (!row.original.locationId) return <span>-</span>;
        const location = locationList.filter(l => l.id === row.original.locationId)[0];
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
      size: 100,
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
        onBulkDelete={handleBulkDelete}
        bulkEditFields={bulkEditFields}
        onBulkEdit={handleBulkEdit}
        buttons={[
          <AddButton onClick={async () => router.push(`/storages/new`)} subject="Storage" key="add" />
        ]}
      />
    </section>
  );
}
