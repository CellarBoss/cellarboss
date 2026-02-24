"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUsers, deleteUser, type AdminUser } from "@/lib/api/users";
import { DataTable } from "@/components/datatable/components/DataTable";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { AddButton } from "@/components/buttons/AddButton";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = authClient.useSession();
  const isAdmin = session.data?.user?.role === "admin";

  const usersQuery = useApiQuery({ queryKey: ["users"], queryFn: getUsers });

  if (!isAdmin) {
    return (
      <section>
        <PageHeader title="Users" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          You do not have permission to access this page. Admin rights are
          required.
        </div>
      </section>
    );
  }

  const result = queryGate(usersQuery);
  if (!result.ready) return result.gate;

  const [usersList] = result.data;

  async function handleEdit(row: AdminUser): Promise<void> {
    router.push(`/users/${row.id}/edit`);
  }

  async function handleDelete(row: AdminUser): Promise<boolean> {
    const delResult = await deleteUser(row.id);
    if (!delResult.ok)
      throw new Error("Error deleting user: " + delResult.error.message);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    return true;
  }

  async function handleBulkDelete(rows: AdminUser[]): Promise<void> {
    const errors: string[] = [];
    try {
      for (const row of rows) {
        const result = await deleteUser(row.id);
        if (!result.ok) errors.push(result.error.message);
      }
    } finally {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
    if (errors.length)
      throw new Error("Error deleting user: " + errors.join(", "));
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }: { row: { original: AdminUser } }) => (
        <a href={`/users/${row.original.id}`}>{row.original.name}</a>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      cell: ({ row }: { row: { original: AdminUser } }) => (
        <span className="capitalize">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "options",
      id: "options",
      header: "",
      size: 100,
      enableSorting: false,
      cell: ({ row }: { row: { original: AdminUser } }) => (
        <div className="flex gap-1 justify-center mx-5">
          <EditButton onEdit={() => handleEdit(row.original)} />
          <DeleteButton
            itemDescription={`${row.original.name} (${row.original.email})`}
            onDelete={() => handleDelete(row.original)}
          />
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader title="Users" />
      <DataTable<AdminUser>
        data={usersList}
        columns={columns}
        filterColumnName="name"
        defaultSortColumn="name"
        onBulkDelete={handleBulkDelete}
        buttons={[
          <AddButton
            key="add"
            onClick={async () => router.push("/users/new")}
            subject="User"
          />,
        ]}
      />
    </section>
  );
}
