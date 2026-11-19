import type { NameMap, ParseResult, StyleMap, TreeNode, WebflowNode, XscpData } from "../types";

export function parseWebflowClipboard(raw: string | null | undefined): ParseResult {
  if (!raw?.trim()) return { ok: false, error: "The clipboard is empty." };

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "The pasted content isn't valid JSON." };
  }

  if (!isXscpData(data)) {
    return { ok: false, error: "The JSON doesn't match Webflow's clipboard format." };
  }
  return { ok: true, data };
}

function isXscpData(value: unknown): value is XscpData {
  if (typeof value !== "object" || value === null) return false;
  const { type, payload } = value as {
    type?: unknown;
    payload?: { nodes?: unknown; styles?: unknown };
  };
  return (
    type === "@webflow/XscpData" && Array.isArray(payload?.nodes) && Array.isArray(payload?.styles)
  );
}

/** Ids of the top-level element nodes (not text, not anyone's child). */
function findRoots(nodes: WebflowNode[]): WebflowNode[] {
  const childIds = new Set(nodes.flatMap((n) => n.children ?? []));
  return nodes.filter((n) => !n.text && !childIds.has(n._id));
}

/** Turns Webflow's flat node list into a tree, skipping text nodes. */
export function buildTree(nodes: WebflowNode[]): TreeNode[] {
  const byId = new Map(nodes.map((n) => [n._id, n]));

  const toTree = (n: WebflowNode): TreeNode => ({
    id: n._id,
    type: n.type,
    tag: n.tag,
    classes: n.classes ?? [],
    children: (n.children ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is WebflowNode => c !== undefined && !c.text)
      .map(toTree),
  });

  return findRoots(nodes).map(toTree);
}

/** Summary shown once an element is pasted. */
export function summarize(data: XscpData) {
  const elements = data.payload.nodes.filter((n) => !n.text);
  return {
    rootTag: findRoots(data.payload.nodes)[0]?.tag,
    elementCount: elements.length,
    classCount: data.payload.styles.length,
  };
}

export function toStyleMap(data: XscpData | null): StyleMap {
  return Object.fromEntries((data?.payload.styles ?? []).map((s) => [s._id, s]));
}

export function initialNames(data: XscpData): NameMap {
  return Object.fromEntries(data.payload.styles.map((s) => [s._id, s.name]));
}

export function isRenamed(style: { name: string }, value: string | undefined): boolean {
  return (value ?? "").trim() !== style.name;
}

/** Ids of invalid classes: empty names, or duplicates among base (non-combo) classes. */
export function findInvalid(names: NameMap, styles: StyleMap): Set<string> {
  const invalid = new Set<string>();
  const seen = new Map<string, string>();

  for (const [id, name] of Object.entries(names)) {
    const key = name.trim().toLowerCase();
    if (!key) {
      invalid.add(id);
      continue;
    }
    if (styles[id]?.comb) continue;

    const firstId = seen.get(key);
    if (firstId === undefined) {
      seen.set(key, id);
    } else {
      invalid.add(id);
      invalid.add(firstId);
    }
  }
  return invalid;
}

/** Applies the new names. Only `style.name` changes; ids stay the same so references hold. */
export function applyNames(data: XscpData, names: NameMap): string {
  const copy = structuredClone(data);
  for (const style of copy.payload.styles) {
    const name = names[style._id];
    if (name != null) style.name = name.trim();
  }
  return JSON.stringify(copy);
}

/**
 * Webflow only reads the "application/json" MIME type on paste.
 * navigator.clipboard.writeText() can only write text/plain, so we hook the `copy`
 * event and trigger it with execCommand - still the only way to set a custom type
 * synchronously from a click handler.
 */
export function copyToWebflow(json: string): boolean {
  const onCopy = (e: ClipboardEvent) => {
    e.clipboardData?.setData("application/json", json);
    e.preventDefault();
  };
  document.addEventListener("copy", onCopy, { once: true });
  const ok = document.execCommand("copy");
  document.removeEventListener("copy", onCopy);
  return ok;
}
