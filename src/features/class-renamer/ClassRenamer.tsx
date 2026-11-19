"use client";

import { ClassesPanel } from "./components/ClassesPanel";
import { PasteZone } from "./components/PasteZone";
import { useClassRenamer } from "./hooks/useClassRenamer";

export function ClassRenamer() {
  const { data, tree, styles, names, invalid, error, copied, handlePaste, rename, copy } =
    useClassRenamer();

  return (
    <div className="grid gap-8 lg:grid-cols-[0.5fr_1fr]">
      <div>
        <PasteZone data={data} error={error} onPaste={handlePaste} />
      </div>

      <ClassesPanel
        tree={tree}
        styles={styles}
        names={names}
        invalid={invalid}
        onRename={rename}
        onCopy={copy}
        copied={copied}
      />
    </div>
  );
}
