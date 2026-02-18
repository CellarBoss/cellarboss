export function stringifyValues<T>(data: T): any {
  if (data === null || data === undefined) {
    return "";
  }

  if (Array.isArray(data)) {
    return data.map((item) => stringifyValues(item));
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key in data) {
      result[key] = stringifyValues((data as Record<string, any>)[key]);
    }
    return result;
  }

  return String(data);
}

export function formatStatus(status: string): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type TreeNode<T> = T & { subRows: TreeNode<T>[]; };

export function buildTree<T extends { id: number; }>(
  items: T[],
  parentKey: keyof T
): TreeNode<T>[] {
  const map = new Map<number, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, subRows: [] });
  }

  for (const node of map.values()) {
    const parentId = node[parentKey] as number | null;
    if (parentId != null && map.has(parentId)) {
      map.get(parentId)!.subRows.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
