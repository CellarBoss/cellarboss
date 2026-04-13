"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useVersionMismatch } from "@cellarboss/common";
import { api } from "@/lib/api/client";

const frontendVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "development";

export function VersionMismatchBanner() {
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("version-mismatch-dismissed") === "true",
  );
  const { isMismatch, backendVersion } = useVersionMismatch({
    frontendVersion,
    queryFn: () => api.version.get(),
  });

  if (!isMismatch || dismissed) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
    >
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm flex-1">
        The application version (v{frontendVersion}) is newer than the server (v
        {backendVersion}). Some features may not work correctly until the server
        is updated.
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem("version-mismatch-dismissed", "true");
          setDismissed(true);
        }}
        className="shrink-0 rounded-md p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
        aria-label="Dismiss version warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
