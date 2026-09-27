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

  // Walk each storage's subtree separately so circular parent references in
  // bad data can't leave a cached set incomplete
  const result = new Map<number, Set<number>>();
  for (const s of storages) {
    const desc = new Set<number>([s.id]);
    const stack = [s.id];
    while (stack.length > 0) {
      const id = stack.pop()!;
      for (const childId of childrenMap.get(id) ?? []) {
        if (!desc.has(childId)) {
          desc.add(childId);
          stack.push(childId);
        }
      }
    }
    result.set(s.id, desc);
  }
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
