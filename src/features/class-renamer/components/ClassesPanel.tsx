import { useMemo, useState } from "react";

import { isRenamed } from "../lib/webflow";
import type { NameMap, StyleMap, TreeNode } from "../types";
import { Node } from "./Node";

/** Keeps a node if it matches, or if one of its descendants does. */
function filterTree(nodes: TreeNode[], keep: (node: TreeNode) => boolean): TreeNode[] {
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, keep);
    return keep(node) || children.length > 0 ? [{ ...node, children }] : [];
  });
}

type ClassesPanelProps = {
  tree: TreeNode[];
  styles: StyleMap;
  names: NameMap;
  invalid: Set<string>;
  onRename: (id: string, value: string) => void;
  onCopy: () => void;
  copied: boolean;
};

const tabClass = (active: boolean) =>
  `h-8 px-3 font-mono text-xs transition-colors ${
    active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
  }`;

export function ClassesPanel({
  tree,
  styles,
  names,
  invalid,
  onRename,
  onCopy,
  copied,
}: ClassesPanelProps) {
  const [query, setQuery] = useState("");
  const [onlyModified, setOnlyModified] = useState(false);

  const allStyles = Object.values(styles);
  const isEmpty = tree.length === 0;
  const modifiedCount = allStyles.filter((style) => isRenamed(style, names[style._id])).length;

  const visibleTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !onlyModified) return tree;

    const matches = (id: string) => {
      const style = styles[id];
      if (!style) return false;
      const current = (names[id] ?? "").trim();
      if (onlyModified && current === style.name) return false;
      if (!q) return true;
      return current.toLowerCase().includes(q) || style.name.toLowerCase().includes(q);
    };

    return filterTree(tree, (node) => node.classes.some(matches));
  }, [tree, styles, names, query, onlyModified]);

  return (
    <section
      aria-labelledby="classes-heading"
      className="flex min-w-0 flex-col border border-border bg-background"
    >
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

          <div
            role="group"
            aria-label="Show classes"
            className="flex h-10 items-center border border-border p-1"
          >
            <button
              type="button"
              aria-pressed={!onlyModified}
              onClick={() => setOnlyModified(false)}
              className={tabClass(!onlyModified)}
            >
              All
            </button>
            <button
              type="button"
              aria-pressed={onlyModified}
              onClick={() => setOnlyModified(true)}
              className={tabClass(onlyModified)}
            >
              Modified · {modifiedCount}
            </button>
          </div>
        </div>
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
              />
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            {isEmpty
              ? "Paste an element to see its classes."
              : onlyModified && !query
                ? "No class renamed yet."
                : "No class matches your filter."}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-end gap-4 border-t border-border px-4 py-3">
        {invalid.size > 0 ? (
          <span role="alert" className="text-xs text-danger">
            Some classes are empty or duplicated.
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">then ⌘ V in the Designer</span>
        )}

        <button
          type="button"
          onClick={onCopy}
          disabled={isEmpty || invalid.size > 0}
          className="flex min-h-12 items-center gap-2 bg-primary px-6 text-sm font-medium text-primary-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
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
          <span aria-live="polite">{copied ? "Copied!" : "Copy for Webflow"}</span>
        </button>
      </div>
    </section>
  );
}
