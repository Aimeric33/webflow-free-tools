import { ChevronRight, RotateCcw } from "lucide-react";
import { useId } from "react";

import { describeNode } from "../lib/node-types";
import { isRenamed } from "../lib/webflow";
import type { NameMap, StyleMap, TreeNode, WebflowStyle } from "../types";

type ClassInputProps = {
  id: string;
  style: WebflowStyle;
  value: string;
  invalid: boolean;
  onRename: (id: string, value: string) => void;
};

function ClassInput({ id, style, value, invalid, onRename }: ClassInputProps) {
  const combo = Boolean(style.comb);
  const changed = isRenamed(style, value);

  const tone = invalid
    ? "border-danger text-danger"
    : changed
      ? "border-foreground text-foreground"
      : "border-border text-secondary";

  return (
    <input
      aria-label={`${combo ? "Combo class" : "Class"} ${style.name}`}
      aria-invalid={invalid || undefined}
      value={value}
      onChange={(e) => onRename(id, e.target.value)}
      size={Math.max(value.length, 4)}
      spellCheck={false}
      autoComplete="off"
      data-class-input
      className={`border bg-background px-2 py-1 font-mono transition-colors outline-none focus:border-primary focus:text-foreground ${tone}`}
    />
  );
}

export type NodeProps = {
  node: TreeNode;
  styles: StyleMap;
  names: NameMap;
  invalid: Set<string>;
  onRename: (id: string, value: string) => void;
  /** Restores a class's original name. */
  onReset: (id: string) => void;
  /** Ids of the nodes whose children are hidden. */
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  /** Ignore collapsed state, e.g. while a filter is active so matches stay visible. */
  forceOpen?: boolean;
};

/** Number of elements nested under a node, at any depth. */
function countDescendants(node: TreeNode): number {
  return node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);
}

function hasInvalidDescendant(node: TreeNode, invalid: Set<string>): boolean {
  return node.children.some(
    (child) => child.classes.some((id) => invalid.has(id)) || hasInvalidDescendant(child, invalid),
  );
}

export function Node({
  node,
  styles,
  names,
  invalid,
  onRename,
  onReset,
  collapsedIds,
  onToggle,
  forceOpen = false,
}: NodeProps) {
  const collapsed = collapsedIds.has(node.id);
  const childrenId = useId();

  const { label, Icon } = describeNode(node);
  const classStyles = node.classes.flatMap((id) => (styles[id] ? [styles[id]] : []));
  const renamed = classStyles.filter((style) => isRenamed(style, names[style._id]));

  const hasChildren = node.children.length > 0;
  const open = hasChildren && (forceOpen || !collapsed);
  const hiddenError = hasChildren && !open && hasInvalidDescendant(node, invalid);

  return (
    <li>
      <div className="flex min-h-12 flex-wrap items-center gap-2 py-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            disabled={forceOpen}
            aria-expanded={open}
            aria-controls={childrenId}
            aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
            className={`grid size-6 shrink-0 place-items-center transition-colors hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent ${
              hiddenError ? "text-danger" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChevronRight
              aria-hidden="true"
              size={14}
              strokeWidth={2}
              strokeLinecap="square"
              strokeLinejoin="miter"
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="size-6 shrink-0" />
        )}

        <span
          title={node.tag ? `${node.type} <${node.tag}>` : node.type}
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center border border-border font-mono text-xs text-muted-foreground"
        >
          <Icon size={14} strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter" />
        </span>
        <span title={label} className="w-20 truncate font-mono text-xs text-muted-foreground">
          {label}
        </span>

        {classStyles.map((style) => (
          <ClassInput
            key={style._id}
            id={style._id}
            style={style}
            value={names[style._id] ?? ""}
            invalid={invalid.has(style._id)}
            onRename={onRename}
          />
        ))}

        {classStyles.length === 0 && (
          <span className="font-mono text-xs text-muted-foreground">No class</span>
        )}

        {renamed.map((style) => (
          <button
            key={style._id}
            type="button"
            onClick={() => onReset(style._id)}
            title={`Restore "${style.name}"`}
            aria-label={`Restore original name ${style.name}`}
            className="group flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw
              aria-hidden="true"
              size={12}
              strokeWidth={2}
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <s className="group-hover:no-underline">{style.name}</s>
          </button>
        ))}

        {hasChildren && !open && (
          <span
            className={`font-mono text-xs ${hiddenError ? "text-danger" : "text-muted-foreground"}`}
          >
            {countDescendants(node)} nested{hiddenError ? " · contains errors" : ""}
          </span>
        )}
      </div>

      {hasChildren && (
        <ul id={childrenId} hidden={!open} className="pl-8">
          {node.children.map((child) => (
            <Node
              key={child.id}
              node={child}
              styles={styles}
              names={names}
              invalid={invalid}
              onRename={onRename}
              onReset={onReset}
              collapsedIds={collapsedIds}
              onToggle={onToggle}
              forceOpen={forceOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
