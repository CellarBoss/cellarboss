"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getWinemakers } from "@/lib/api/winemakers";
import { DataTable } from "@/components/datatable/DataTable";
import type { WineMaker } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { deleteWinemaker } from "@/lib/api/winemakers";
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function WinemakersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: WineMaker): Promise<void> {
    router.push(`/winemakers/${row.id}/edit`);
  }

  async function handleDelete(row: WineMaker): Promise<boolean> {
    const delResult = await deleteWinemaker(row.id);
    if (!delResult.ok) throw new Error("Error deleting winemaker: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["winemakers"] });
    return true;
  }

  const winemakerQuery = useApiQuery({ queryKey: ["winemakers"], queryFn: getWinemakers });

  const result = queryGate(winemakerQuery);
  if (!result.ready) return result.gate;

  const [winemakersList] = result.data;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Winemaker Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: WineMaker } }) => {
        return (
          <a href={"/winemakers/" + row.original.id}>{row.original.name}</a>
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
      cell: ({ row }: { row: { original: WineMaker } }) => {
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
      <PageHeader title="Winemakers" />
      <DataTable<WineMaker>
        data={winemakersList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        buttons={[
          <AddButton onClick={async () => router.push(`/winemakers/new`)} subject="Winemaker" key="add" />
        ]}
      />
    </section>
  );
}
