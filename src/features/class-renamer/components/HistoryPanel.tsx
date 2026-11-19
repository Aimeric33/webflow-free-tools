import { Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useId } from "react";

import type { HistoryEntry } from "../lib/history";

export type HistoryItem = { entry: HistoryEntry; canUndo: boolean; canRedo: boolean };

type HistoryPanelProps = {
  items: HistoryItem[];
  canUndoLast: boolean;
  canRedoLast: boolean;
  hasChanges: boolean;
  onUndo: (entryId?: number) => void;
  onRedo: (entryId?: number) => void;
  onResetAll: () => void;
  className?: string;
};

const iconProps = {
  size: 14,
  strokeWidth: 2,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

const toolButton =
  "flex h-8 items-center gap-2 px-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const KIND_LABEL: Record<HistoryEntry["kind"], string> = {
  rename: "Rename",
  replace: "Replace",
  reset: "Reset",
};

function plural(count: number) {
  return `${count} ${count === 1 ? "class" : "classes"}`;
}

function Description({ entry }: { entry: HistoryEntry }) {
  const first = entry.edits[0];

  if (entry.kind === "replace") {
    return (
      <>
        &quot;{entry.find}&quot; → &quot;{entry.replacement}&quot;
        <span className="text-muted-foreground"> · {plural(entry.edits.length)}</span>
      </>
    );
  }
  if (entry.kind === "reset" && entry.edits.length > 1) {
    return <>All renamed classes · {plural(entry.edits.length)}</>;
  }
  return (
    <>
      {first?.before || "(empty)"} → {first?.after || "(empty)"}
    </>
  );
}

export function HistoryPanel({
  items,
  canUndoLast,
  canRedoLast,
  hasChanges,
  onUndo,
  onRedo,
  onResetAll,
  className = "",
}: HistoryPanelProps) {
  const headingId = useId();
  const newestFirst = [...items].reverse();

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col gap-4 border border-border bg-background p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 id={headingId} className="text-base">
            History
          </h2>
          <span className="border border-border px-2 font-mono text-xs text-muted-foreground">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUndo()}
            disabled={!canUndoLast}
            title="Undo (⌘Z)"
            className={toolButton}
          >
            <Undo2 aria-hidden="true" {...iconProps} />
            Undo
          </button>
          <button
            type="button"
            onClick={() => onRedo()}
            disabled={!canRedoLast}
            title="Redo (⌘⇧Z)"
            className={toolButton}
          >
            <Redo2 aria-hidden="true" {...iconProps} />
            Redo
          </button>
          <button
            type="button"
            onClick={onResetAll}
            disabled={!hasChanges}
            title="Restore every original class name"
            className={toolButton}
          >
            <RotateCcw aria-hidden="true" {...iconProps} />
            Reset all
          </button>
        </div>
      </div>

      {newestFirst.length > 0 ? (
        <ol className="max-h-64 min-h-0 flex-1 overflow-y-auto border-t border-border lg:max-h-none">
          {newestFirst.map(({ entry, canUndo, canRedo }) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 border-b border-border py-2 last:border-b-0"
            >
              <span className="w-16 shrink-0 font-mono text-xs tracking-eyebrow text-muted-foreground uppercase">
                {KIND_LABEL[entry.kind]}
              </span>
              <span
                className={`min-w-0 flex-1 truncate font-mono text-sm ${
                  entry.undone ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                <Description entry={entry} />
              </span>
              {entry.undone ? (
                <button
                  type="button"
                  onClick={() => onRedo(entry.id)}
                  disabled={!canRedo}
                  title={
                    canRedo ? "Redo this change" : "A class it touches was changed again since."
                  }
                  className={toolButton}
                >
                  Redo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUndo(entry.id)}
                  disabled={!canUndo}
                  title={
                    canUndo
                      ? "Undo this change only"
                      : "A newer change touches the same class. Undo that one first."
                  }
                  className={toolButton}
                >
                  Undo
                </button>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="border-t border-border pt-4 font-mono text-xs text-muted-foreground">
          No change yet. Every rename, replace and reset shows up here and can be undone on its own.
        </p>
      )}
    </section>
  );
}
