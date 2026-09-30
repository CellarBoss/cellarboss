import type { ApiResult } from "../types";
import type { ServerVersion } from "../resources/version";
import { useApiQuery } from "./use-api-query";

/**
 * Format a version for display with exactly one leading "v", whether it came
 * in as a release tag ("v0.9.8") or a bare version ("0.9.8"). Non-numeric
 * versions such as "development" are returned unchanged.
 */
export function normalizeVersion(version: string): string {
  const bare = version.replace(/^v/, "");
  return /^\d/.test(bare) ? `v${bare}` : version;
}

/**
 * Parse a semver string into [major, minor, patch].
 * Returns null if the string is not valid semver.
 */
function parseSemver(version: string): [number, number, number] | null {
  const parts = version.replace(/^v/, "").split(".");
  if (parts.length !== 3) return null;

  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some((n) => isNaN(n) || n < 0)) return null;

  return nums as [number, number, number];
}

/**
 * Returns true when the frontend version is strictly newer than the backend
 * version by semver comparison. Returns false if either version is
 * "development" or cannot be parsed.
 */
export function isVersionMismatch(
  frontendVersion: string,
  backendVersion: string,
): boolean {
  if (frontendVersion === "development" || backendVersion === "development") {
    return false;
  }

  const fe = parseSemver(frontendVersion);
  const be = parseSemver(backendVersion);
  if (!fe || !be) return false;

  for (let i = 0; i < 3; i++) {
    if (fe[i] > be[i]) return true;
    if (fe[i] < be[i]) return false;
  }

  return false;
}

export function useVersionMismatch(options: {
  frontendVersion: string;
  queryFn: () => Promise<ApiResult<ServerVersion>>;
}): {
  isMismatch: boolean;
  frontendVersion: string;
  backendVersion: string | null;
  isLoading: boolean;
} {
  const { frontendVersion, queryFn } = options;

  const query = useApiQuery<ServerVersion>({
    queryKey: ["serverVersion"],
    queryFn,
    staleTime: Infinity,
  });

  const rawBackendVersion = query.data?.version ?? null;
  const isMismatch =
    rawBackendVersion !== null &&
    isVersionMismatch(frontendVersion, rawBackendVersion);

  return {
    isMismatch,
    frontendVersion: normalizeVersion(frontendVersion),
    backendVersion:
      rawBackendVersion !== null ? normalizeVersion(rawBackendVersion) : null,
    isLoading: query.isLoading,
  };
}
