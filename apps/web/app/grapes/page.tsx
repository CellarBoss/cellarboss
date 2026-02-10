"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/DataTable";
import type { Grape } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page/PageHeader";
import { AddButton } from "@/components/buttons/AddButton";
import { deleteGrape, getGrapes } from "@/lib/api/grapes";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function GrapesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleEdit(row: Grape): Promise<void> {
    router.push(`/grapes/${row.id}/edit`);
  }

  async function handleDelete(row: Grape): Promise<boolean> {
    console.log("Delete row:", row);

    try {
      if(!row.id) throw new Error("Invalid grape ID");

      var delResult = await deleteGrape(row.id);
      if(!delResult.ok) {
        throw new Error("Error deleting grape: " + delResult.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['grapes'] })

      return true;
    } catch (err: any) {
      console.error("Delete failed:", err);
      throw err;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["grapes"],
    queryFn: getGrapes,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!data?.ok) return <ErrorCard message={`Error receiving data: ` + data?.error.message } />;

  var grapesList = data.data;

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
      minSize: 100,
      maxSize: 100,
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
        buttons={[
          <AddButton onClick={async () => router.push(`/grapes/new`)} subject="Grape" key="add" />
        ]}
        />
    </section>
  );
}