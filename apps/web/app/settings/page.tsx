"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page/PageHeader";
import { useSettings } from "@/hooks/use-settings";
import { authClient } from "@/lib/auth-client";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";
import { EditButton } from "@/components/buttons/EditButton";
import { type ParsedSettingsMap } from "@/lib/constants/settings";

export default function SettingsAdminPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const settingsQuery = useSettings();

  const isAdmin = session.data?.user?.role === "admin";

  if (settingsQuery.isLoading) {
    return <LoadingCard />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorCard
        message={settingsQuery.error?.message || "Failed to load settings"}
      />
    );
  }

  if (!isAdmin) {
    return (
      <section>
        <PageHeader title="System Settings" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          You do not have permission to access this page. Admin rights are
          required.
        </div>
      </section>
    );
  }

  const settings = settingsQuery.data as ParsedSettingsMap;

  return (
    <section>
      <PageHeader title="System Settings" />

      {settings.size === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          No settings configured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(settings.entries()).map(([key, value]) => (
            <div
              key={key}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent"
            >
              <div>
                <div className="font-medium text-foreground">{key}</div>
                <div className="text-sm text-muted-foreground">
                  {value === null ? (
                    <span className="italic text-muted-foreground/60">
                      null
                    </span>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
              <EditButton
                onEdit={async () =>
                  router.push(`/settings/${encodeURIComponent(key)}/edit`)
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
