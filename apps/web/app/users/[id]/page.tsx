"use client";

import { useParams, useRouter } from "next/navigation";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { getUserById, deleteUser } from "@/lib/api/users";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const userQuery = useApiQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const result = queryGate([userQuery]);
  if (!result.ready) return result.gate;

  const [user] = result.data;

  return (
    <section>
      <PageHeader
        title={user.name}
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/users/${userId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteUser(userId);
                if (result.ok) router.push("/users");
                return result.ok;
              }}
              itemDescription={user.name}
            />
          </>
        }
      />

      <DetailCard heading="User Details" icon={User}>
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <DetailRow icon={Mail}>{user.email}</DetailRow>
        <DetailRow icon={Shield}>
          <Badge variant="secondary">{user.role}</Badge>
        </DetailRow>
        <DetailRow icon={Calendar}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </DetailRow>
        {user.banned && (
          <Badge variant="destructive" className="mt-2">
            Banned{user.banReason ? `: ${user.banReason}` : ""}
          </Badge>
        )}
      </DetailCard>
    </section>
  );
}
