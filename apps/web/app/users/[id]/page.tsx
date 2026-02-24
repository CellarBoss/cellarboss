"use client";

import { useParams } from "next/navigation";
import { getUserById, type AdminUser } from "@/lib/api/users";
import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { viewUserFields } from "@/lib/fields/users";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewUserPage() {
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

  return (
    <section>
      <PageHeader title={`View User — ${user.name}`} />
      <GenericCard<AdminUser> mode="view" data={user} fields={viewUserFields} />
    </section>
  );
}
