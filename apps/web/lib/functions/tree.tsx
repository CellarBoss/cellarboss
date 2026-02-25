const INDENT_UNIT = "\u00A0\u00A0"; // 2 non-breaking spaces

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
    const indent = INDENT_UNIT.repeat(depth);
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

export function sortHierarchicalOptions(
  options: Array<{ value: string; label: string }>,
): Array<{ value: string; label: string }> {
  type ParsedOption = {
    value: string;
    label: string;
    depth: number;
    name: string;
  };

  // Parse depth and name for each option
  const parsed: ParsedOption[] = options.map((opt) => {
    let depth = 0;
    while (opt.label.startsWith(INDENT_UNIT.repeat(depth + 1))) {
      depth++;
    }
    const name = opt.label.slice(depth * INDENT_UNIT.length);
    return { value: opt.value, label: opt.label, depth, name };
  });

  // Recursively sort items at each depth level while preserving hierarchy
  function sortByLevel(
    items: ParsedOption[],
    targetDepth: number = 0,
  ): ParsedOption[] {
    // Get all items at targetDepth
    const itemsAtLevel = items.filter((item) => item.depth === targetDepth);
    const sorted = itemsAtLevel.sort((a, b) => a.name.localeCompare(b.name));

    const result: ParsedOption[] = [];
    for (const item of sorted) {
      result.push(item);
      // Find all children of this item and recursively sort them
      const itemIndex = items.indexOf(item);
      const nextItemIndex = items.findIndex(
        (other, idx) => idx > itemIndex && other.depth <= targetDepth,
      );
      const childrenEndIndex =
        nextItemIndex === -1 ? items.length : nextItemIndex;
      const children = items.slice(itemIndex + 1, childrenEndIndex);

      if (children.length > 0 && children[0].depth > targetDepth) {
        result.push(...sortByLevel(children, targetDepth + 1));
      }
    }

    return result;
  }

  const sorted = sortByLevel(parsed);
  return sorted.map((item) => ({ value: item.value, label: item.label }));
}
