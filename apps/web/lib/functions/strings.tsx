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

const MAX_EXPANSION_RESULTS = 1000;

function expandNamePatternImpl(name: string, results: string[]): void {
  // Stop if we've reached the maximum
  if (results.length >= MAX_EXPANSION_RESULTS) return;

  // Regex only matches valid same-category ranges (digits, uppercase, or lowercase)
  const match = name.match(
    /\[(\d)-(\d)\]|\[([A-Z])-([A-Z])\]|\[([a-z])-([a-z])\]/,
  );

  if (!match) {
    results.push(name);
    return;
  }

  const fullMatch = match[0];
  const startChar = (match[1] ?? match[3] ?? match[5])!;
  const endChar = (match[2] ?? match[4] ?? match[6])!;
  const startCode = startChar.charCodeAt(0);
  const endCode = endChar.charCodeAt(0);

  // Treat reverse ranges as literals (no expansion)
  if (endCode < startCode) {
    results.push(name);
    return;
  }

  for (let code = startCode; code <= endCode; code++) {
    if (results.length >= MAX_EXPANSION_RESULTS) break;
    // Replace only the first occurrence of this match, then recurse for remaining brackets
    const expanded = name.replace(fullMatch, String.fromCharCode(code));
    expandNamePatternImpl(expanded, results);
  }
}

export function expandNamePattern(name: string): string[] {
  const results: string[] = [];
  expandNamePatternImpl(name, results);
  return results;
}
