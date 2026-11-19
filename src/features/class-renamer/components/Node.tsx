import { isRenamed } from "../lib/webflow";
import type { NameMap, StyleMap, TreeNode, WebflowStyle } from "../types";

const TYPES: Record<string, { label: string; icon: string }> = {
  Section: { label: "Section", icon: "S" },
  Block: { label: "Div Block", icon: "D" },
  BlockContainer: { label: "Container", icon: "C" },
  Container: { label: "Container", icon: "C" },
  Heading: { label: "Heading", icon: "H" },
  Paragraph: { label: "Paragraph", icon: "P" },
  Link: { label: "Link", icon: "A" },
  LinkBlock: { label: "Link Block", icon: "A" },
  Image: { label: "Image", icon: "I" },
  List: { label: "List", icon: "L" },
  ListItem: { label: "List Item", icon: "•" },
  FormWrapper: { label: "Form", icon: "F" },
};

function describeType(type: string | undefined) {
  if (type && TYPES[type]) return TYPES[type];
  return { label: type ?? "Unknown", icon: type?.[0] ?? "?" };
}

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
};

export function Node({ node, styles, names, invalid, onRename }: NodeProps) {
  const type = describeType(node.type);
  const classStyles = node.classes.flatMap((id) => (styles[id] ? [styles[id]] : []));
  const renamed = classStyles.filter((style) => isRenamed(style, names[style._id]));

  return (
    <li>
      <div className="flex min-h-12 flex-wrap items-center gap-2 py-1">
        <span
          title={node.type}
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center border border-border font-mono text-xs text-muted-foreground"
        >
          {type.icon}
        </span>
        <span className="w-20 truncate font-mono text-xs text-muted-foreground">{type.label}</span>

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
          <s key={style._id} className="font-mono text-xs text-muted-foreground">
            {style.name}
          </s>
        ))}
      </div>

      {node.children.length > 0 && (
        <ul className="ml-3 border-l border-border pl-6">
          {node.children.map((child) => (
            <Node
              key={child.id}
              node={child}
              styles={styles}
              names={names}
              invalid={invalid}
              onRename={onRename}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
