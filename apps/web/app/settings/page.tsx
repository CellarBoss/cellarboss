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

  const isAdmin = (session.data?.user as any)?.role === "admin";

  if (settingsQuery.isLoading) {
    return <LoadingCard />;
  }

  if (settingsQuery.isError) {
    return <ErrorCard message={settingsQuery.error?.message || "Failed to load settings"} />;
  }

  if (!isAdmin) {
    return (
      <section>
        <PageHeader title="System Settings" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          You do not have permission to access this page. Admin rights are required.
        </div>
      </section>
    );
  }

  const settings = settingsQuery.data as ParsedSettingsMap;

  return (
    <section>
      <PageHeader title="System Settings" />

      {settings.size === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No settings configured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(settings.entries()).map(([key, value]) => (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-900">{key}</div>
                <div className="text-sm text-gray-600">
                  {value === null ? (
                    <span className="italic text-gray-400">null</span>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
              <EditButton onEdit={async () => router.push(`/settings/${encodeURIComponent(key)}/edit`)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
