"use client";

import { useParams } from "next/navigation";
import {
  getUserById,
  updateUser,
  type AdminUser,
  type UserFormData,
} from "@/lib/api/users";
import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { editUserFields } from "@/lib/fields/users";
import type { ApiResult } from "@/lib/api/types";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(data: UserFormData): Promise<ApiResult<AdminUser>> {
  return updateUser(data);
}

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;

  const userQuery = useApiQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const result = queryGate(userQuery);
  if (!result.ready) return result.gate;

  const [user] = result.data;

  const formData: UserFormData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password: "",
  };

  return (
    <section>
      <PageHeader title={`Edit User — ${user.name}`} />
      <GenericCard<UserFormData>
        mode="edit"
        data={formData}
        fields={editUserFields}
        processSave={handleUpdate}
        redirectTo="/users"
      />
    </section>
  );
}
