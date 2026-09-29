import type { CheerioAPI } from "cheerio";

/** Where `name = {` or `name = [` starts in a script, e.g. `const product = {`. */
function assignment(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[\\s;,(])${escaped}\\s*=\\s*(?=[{[])`, "m");
}

/**
 * The JSON literal that starts at `start`, found by matching brackets outside
 * strings. Returns undefined when it isn't valid JSON.
 */
function jsonAt(text: string, start: number): unknown {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}

/** The JSON a script assigns to `name`, if it does. */
export function readAssignment(script: string, name: string): unknown {
  const match = assignment(name).exec(script);
  return match ? jsonAt(script, match.index + match[0].length) : undefined;
}

/**
 * Finds the JSON object an inline script assigns to a variable, such as
 * Naked Wines' `const product = {...}`. Only JSON literals are read; the
 * script is never run.
 */
export function readInlineObject($: CheerioAPI, name: string): unknown {
  let result: unknown;
  $("script:not([src])").each((_, el) => {
    const value = readAssignment($(el).text(), name);
    if (value === undefined) return;
    result = value;
    return false;
  });
  return result;
}
