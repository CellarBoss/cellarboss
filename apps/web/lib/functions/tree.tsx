
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