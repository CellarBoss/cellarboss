"use client";

import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { createUser, type AdminUser, type UserFormData } from "@/lib/api/users";
import { createUserFields } from "@/lib/fields/users";
import type { ApiResult } from "@/lib/api/types";

async function handleCreate(data: UserFormData): Promise<ApiResult<AdminUser>> {
  return createUser(data);
}

export default function NewUserPage() {
  return (
    <section>
      <PageHeader title="New User" />
      <GenericCard<UserFormData>
        mode="create"
        fields={createUserFields}
        processSave={handleCreate}
        redirectTo="/users"
      />
    </section>
  );
}
