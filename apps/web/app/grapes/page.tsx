"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/DataTable";
import type { Grape } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { deleteGrape, getGrapes } from "@/lib/api/grapes";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function GrapesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Grape): Promise<void> {
    router.push(`/grapes/${row.id}/edit`);
  }

  async function handleDelete(row: Grape): Promise<boolean> {
    const delResult = await deleteGrape(row.id);
    if (!delResult.ok) throw new Error("Error deleting grape: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["grapes"] });
    return true;
  }

  async function handleBulkDelete(rows: Grape[]): Promise<void> {
    for (const row of rows) {
      const result = await deleteGrape(row.id);
      if (!result.ok) throw new Error("Error deleting grape: " + result.error.message);
    }
    queryClient.invalidateQueries({ queryKey: ["grapes"] });
  }

  const grapeQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });

  const result = queryGate(grapeQuery);
  if (!result.ready) return result.gate;

  const [grapesList] = result.data;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Grape Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: Grape } }) => {
        return (
          <a href={"/grapes/" + row.original.id}>{row.original.name}</a>
        )
      }
    },
    {
      accessorKey: 'options',
      id: 'options',
      header: '',
      size: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: Grape } }) => {
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
      <PageHeader title="Grapes"/>
      <DataTable<Grape>
        data={grapesList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        onBulkDelete={handleBulkDelete}
        buttons={[
          <AddButton onClick={async () => router.push(`/grapes/new`)} subject="Grape" key="add" />
        ]}
      />
    </section>
  );
}
