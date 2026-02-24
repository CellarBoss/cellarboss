export type TreeNode<T> = T & { subRows: TreeNode<T>[] };

export function buildTree<T extends { id: number }>(
  items: T[],
  parentKey: keyof T,
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

export function buildHierarchicalOptions<
  T extends { id: number; name: string; subRows?: TreeNode<T>[] },
>(nodes: TreeNode<T>[], depth = 0): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (const node of nodes) {
    const indent = "\u00A0\u00A0".repeat(depth);
    options.push({
      value: String(node.id),
      label: `${indent}${node.name}`,
    });
    if (node.subRows && node.subRows.length > 0) {
      options.push(...buildHierarchicalOptions(node.subRows, depth + 1));
    }
  }
  return options;
}
