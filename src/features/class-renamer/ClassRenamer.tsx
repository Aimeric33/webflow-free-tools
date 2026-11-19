"use client";

import { ClassesPanel } from "./components/ClassesPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { PasteZone } from "./components/PasteZone";
import { ReplaceBar } from "./components/ReplaceBar";
import { useClassRenamer } from "./hooks/useClassRenamer";
import { isRenamed } from "./lib/webflow";

export function ClassRenamer() {
  const {
    data,
    tree,
    styles,
    names,
    invalid,
    error,
    copied,
    historyItems,
    canUndoLast,
    canRedoLast,
    handlePaste,
    copy,
    rename,
    replaceAll,
    resetClass,
    resetAll,
    undo,
    redo,
  } = useClassRenamer();

  const hasChanges = Object.values(styles).some((style) => isRenamed(style, names[style._id]));

  return (
    <div className="flex flex-col gap-6">
      <PasteZone data={data} error={error} onPaste={handlePaste} />

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ReplaceBar names={names} onReplace={replaceAll} />
          {/* Out of the flow on large screens: the row takes Find & replace's height
              (min 256px) and the history list scrolls inside. */}
          <div className="relative lg:min-h-64">
            <HistoryPanel
              items={historyItems}
              canUndoLast={canUndoLast}
              canRedoLast={canRedoLast}
              hasChanges={hasChanges}
              onUndo={undo}
              onRedo={redo}
              onResetAll={resetAll}
              className="lg:absolute lg:inset-0"
            />
          </div>
        </div>
      )}

      <ClassesPanel
        tree={tree}
        styles={styles}
        names={names}
        invalid={invalid}
        onRename={rename}
        onReset={resetClass}
        onCopy={copy}
        copied={copied}
      />
    </div>
  );
}
