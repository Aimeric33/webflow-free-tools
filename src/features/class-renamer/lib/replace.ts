import type { NameMap } from "../types";

export type RepeatedToken = { token: string; count: number };

const SEPARATORS = /[-_\s]+/;

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive, literal (non-regex) matcher for a search string. */
function matcher(find: string) {
  return new RegExp(escapeRegExp(find), "gi");
}

/**
 * Detects the component-specific parts of class names that repeat across classes,
 * typically a library prefix like "header57" in Relume's
 * "section_header57", "header57_component", "header57_content"…
 *
 * A token is suggested when it appears in at least two different class names and either
 * contains a digit ("header57", "layout12") or is the block prefix before "_" ("pricing_…").
 * Sorted by number of classes, then alphabetically.
 */
export function findRepeatedTokens(classNames: string[], limit = 6): RepeatedToken[] {
  const counts = new Map<string, number>();

  for (const name of new Set(classNames.map((n) => n.trim().toLowerCase()))) {
    const tokens = new Set(name.split(SEPARATORS).filter((t) => /\d/.test(t)));
    const blockPrefix = name.includes("_") ? name.split("_")[0] : undefined;
    if (blockPrefix) tokens.add(blockPrefix);

    for (const token of tokens) {
      if (token.length < 3) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts]
    .filter(([, count]) => count >= 2)
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count || a.token.localeCompare(b.token))
    .slice(0, limit);
}

/** Number of class names containing `find` (case-insensitive). */
export function countMatches(names: NameMap, find: string): number {
  if (!find) return 0;
  const re = matcher(find);
  return Object.values(names).filter((name) => {
    re.lastIndex = 0;
    return re.test(name);
  }).length;
}

/** Replaces every occurrence of `find` (case-insensitive, literal) in every class name. */
export function replaceInNames(names: NameMap, find: string, replacement: string): NameMap {
  if (!find) return names;
  const re = matcher(find);
  return Object.fromEntries(
    Object.entries(names).map(([id, name]) => [id, name.replace(re, () => replacement)]),
  );
}
