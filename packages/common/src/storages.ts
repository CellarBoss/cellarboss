import type { Storage } from "@cellarboss/types";

/** Preference key for including sub-storage bottles on a storage's page. */
export const INCLUDE_SUB_STORAGES_PREFERENCE =
  "storages.bottles.includeSubStorages";

/** Build a map from each storage ID to the set of all its descendant IDs (including itself). */
export function buildDescendantsMap(
  storages: Storage[],
): Map<number, Set<number>> {
  const childrenMap = new Map<number, number[]>();
  for (const s of storages) {
    if (s.parent != null) {
      if (!childrenMap.has(s.parent)) childrenMap.set(s.parent, []);
      childrenMap.get(s.parent)!.push(s.id);
    }
  }

  const result = new Map<number, Set<number>>();
  const visiting = new Set<number>();

  function collect(id: number): Set<number> {
    if (result.has(id)) return result.get(id)!;
    const desc = new Set<number>([id]);
    // Guard against circular parent references in bad data
    if (visiting.has(id)) return desc;
    visiting.add(id);
    for (const childId of childrenMap.get(id) ?? []) {
      for (const d of collect(childId)) desc.add(d);
    }
    visiting.delete(id);
    result.set(id, desc);
    return desc;
  }

  for (const s of storages) collect(s.id);
  return result;
}

/**
 * Walk up the tree from a storage, returning the path from the top-level
 * storage down to (and including) the given storage.
 *
 * When `relativeTo` is given, the walk stops below that storage, so the path
 * is relative to it and a storage equal to `relativeTo` returns an empty path.
 */
export function getStorageAncestry(
  storageId: number | null | undefined,
  storageMap: Map<number, Storage>,
  relativeTo?: number,
): Storage[] {
  if (storageId == null) return [];
  const path: Storage[] = [];
  const seen = new Set<number>();
  let current = storageMap.get(storageId);
  while (current && current.id !== relativeTo && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current =
      current.parent != null ? storageMap.get(current.parent) : undefined;
  }
  return path;
}
