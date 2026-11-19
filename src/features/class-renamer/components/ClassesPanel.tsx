import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { NameMap, StyleMap, TreeNode } from "../types";
import { Node } from "./Node";

/** Keeps a node if it matches, or if one of its descendants does. */
function filterTree(nodes: TreeNode[], keep: (node: TreeNode) => boolean): TreeNode[] {
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, keep);
    return keep(node) || children.length > 0 ? [{ ...node, children }] : [];
  });
}

/** Ids of every node that has children, i.e. every node that can be collapsed. */
function collectParentIds(nodes: TreeNode[], ids: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id);
      collectParentIds(node.children, ids);
    }
  }
  return ids;
}

type ClassesPanelProps = {
  tree: TreeNode[];
  styles: StyleMap;
  names: NameMap;
  invalid: Set<string>;
  onRename: (id: string, value: string) => void;
  onReset: (id: string) => void;
  onCopy: () => void;
  copied: boolean;
};

const iconButtonClass =
  "grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const iconProps = {
  size: 14,
  strokeWidth: 2,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

export function ClassesPanel({
  tree,
  styles,
  names,
  invalid,
  onRename,
  onReset,
  onCopy,
  copied,
}: ClassesPanelProps) {
  const [query, setQuery] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const allStyles = Object.values(styles);
  const isEmpty = tree.length === 0;
  const isFiltering = query.trim() !== "";
  const parentIds = useMemo(() => collectParentIds(tree), [tree]);
  const allCollapsed = parentIds.length > 0 && parentIds.every((id) => collapsedIds.has(id));
  const noneCollapsed = parentIds.every((id) => !collapsedIds.has(id));

  const toggle = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const collapseAll = () => setCollapsedIds(new Set(parentIds));
  const expandAll = () => setCollapsedIds(new Set());

  const visibleTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;

    const matches = (id: string) => {
      const style = styles[id];
      if (!style) return false;
      const current = (names[id] ?? "").trim();
      return current.toLowerCase().includes(q) || style.name.toLowerCase().includes(q);
    };

    return filterTree(tree, (node) => node.classes.some(matches));
  }, [tree, styles, names, query]);

  return (
    <section
      aria-labelledby="classes-heading"
      className="flex min-w-0 flex-col border border-border bg-background"
    >
      {/* Sticks under the fixed site header (h-16) so Copy stays reachable while scrolling. */}
      <div className="sticky top-16 z-10 bg-background">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 id="classes-heading" className="text-base">
              Classes
            </h2>
            <span className="border border-border px-2 font-mono text-xs text-muted-foreground">
              {allStyles.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Tree"
              className="flex h-10 items-center gap-1 border border-border p-1"
            >
              <button
                type="button"
                onClick={expandAll}
                disabled={isFiltering || noneCollapsed}
                aria-label="Expand all"
                title="Expand all"
                className={iconButtonClass}
              >
                <ChevronsUpDown aria-hidden="true" {...iconProps} />
              </button>
              <button
                type="button"
                onClick={collapseAll}
                disabled={isFiltering || parentIds.length === 0 || allCollapsed}
                aria-label="Collapse all"
                title="Collapse all"
                className={iconButtonClass}
              >
                <ChevronsDownUp aria-hidden="true" {...iconProps} />
              </button>
            </div>

            <label className="flex h-10 items-center gap-2 border border-border bg-background px-3 focus-within:border-primary">
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                className="text-muted-foreground"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span className="sr-only">Filter classes</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                className="w-36 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>

            <button
              type="button"
              onClick={onCopy}
              disabled={isEmpty || invalid.size > 0}
              className="flex h-10 items-center gap-2 bg-primary px-6 text-sm font-medium text-primary-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <rect x="9" y="9" width="11" height="11" />
                <path d="M5 15V4h11" />
              </svg>
              {copied ? "Copied!" : "Copy for Webflow"}
            </button>
          </div>
        </div>

        {/* Always mounted so screen readers announce the change. */}
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied. Paste it in the Webflow Designer." : ""}
        </span>

        {invalid.size > 0 ? (
          <p role="alert" className="border-b border-border px-4 py-2 text-xs text-danger">
            Some classes are empty or duplicated. Fix them to copy.
          </p>
        ) : (
          copied && (
            <p className="border-b border-border px-4 py-2 font-mono text-xs text-secondary">
              Copied. Paste it in the Webflow Designer with ⌘V.
            </p>
          )
        )}
      </div>

      <div className="p-4 text-sm">
        {visibleTree.length > 0 ? (
          <ul>
            {visibleTree.map((node) => (
              <Node
                key={node.id}
                node={node}
                styles={styles}
                names={names}
                invalid={invalid}
                onRename={onRename}
                onReset={onReset}
                collapsedIds={collapsedIds}
                onToggle={toggle}
                forceOpen={isFiltering}
              />
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            {isEmpty ? "Paste an element to see its classes." : "No class matches your filter."}
          </p>
        )}
      </div>
    </section>
  );
}
