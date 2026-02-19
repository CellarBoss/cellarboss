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

export function formatDrinkingWindow(begin: number | null, end: number | null): string {
  if(begin !== null && end !== null) return `${begin} until ${end}`;
  if(begin === null && end !== null) return `Now until ${end}`;
  if(begin !== null) return `From ${begin}`;
  if(end !== null) return `Until ${end}`;
  return "-";
}

export type DrinkingStatus = 'drinkable' | 'wait' | 'past' | 'unknown';

export function getDrinkingStatus(drinkFrom: number | null, drinkUntil: number | null, currentYear: number): DrinkingStatus {
  if (drinkFrom === null && drinkUntil === null) {
    return 'unknown';
  }
  
  if (drinkUntil !== null && currentYear > drinkUntil) {
    return 'past';
  }
  
  if (drinkFrom !== null && currentYear < drinkFrom) {
    return 'wait';
  }
  
  return 'drinkable';
}

export type TreeNode<T> = T & { subRows: TreeNode<T>[]; };

export function expandNamePattern(name: string): string[] {
  // Regex only matches valid same-category ranges (digits, uppercase, or lowercase)
  const match = name.match(/\[(\d)-(\d)\]|\[([A-Z])-([A-Z])\]|\[([a-z])-([a-z])\]/);

  if (!match) return [name];

  const fullMatch = match[0];
  const startChar = (match[1] ?? match[3] ?? match[5])!;
  const endChar   = (match[2] ?? match[4] ?? match[6])!;
  const startCode = startChar.charCodeAt(0);
  const endCode   = endChar.charCodeAt(0);

  // Treat reverse ranges as literals (no expansion)
  if (endCode < startCode) return [name];

  const results: string[] = [];
  for (let code = startCode; code <= endCode; code++) {
    // Replace only the first occurrence of this match, then recurse for remaining brackets
    const expanded = name.replace(fullMatch, String.fromCharCode(code));
    results.push(...expandNamePattern(expanded));
  }
  return results;
}

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
