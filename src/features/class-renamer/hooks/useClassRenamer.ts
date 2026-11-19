import { useEffect, useMemo, useReducer, useState, type ClipboardEvent } from "react";

import { canRedo, canUndo, emptyHistory, historyReducer } from "../lib/history";
import {
  applyNames,
  buildTree,
  copyToWebflow,
  findInvalid,
  initialNames,
  parseWebflowClipboard,
  toStyleMap,
} from "../lib/webflow";
import type { XscpData } from "../types";

/** Inputs whose own text undo should win over the history shortcut (filter, find, replace…). */
function isForeignTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const isField = target.matches("input, textarea, [contenteditable='true']");
  return isField && !target.hasAttribute("data-class-input");
}

export function useClassRenamer() {
  const [data, setData] = useState<XscpData | null>(null);
  const [history, dispatch] = useReducer(historyReducer, emptyHistory);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const { names, entries } = history;
  const tree = useMemo(() => (data ? buildTree(data.payload.nodes) : []), [data]);
  const styles = useMemo(() => toStyleMap(data), [data]);
  const originals = useMemo(() => (data ? initialNames(data) : {}), [data]);
  const invalid = useMemo(() => findInvalid(names, styles), [names, styles]);

  const historyItems = useMemo(
    () =>
      entries.map((entry) => ({
        entry,
        canUndo: canUndo(entry, names),
        canRedo: canRedo(entry, names),
      })),
    [entries, names],
  );
  const canUndoLast = historyItems.some((item) => item.canUndo);
  const canRedoLast = historyItems.some((item) => item.canRedo);

  // ⌘Z / Ctrl+Z and ⌘⇧Z / Ctrl+Y, except inside fields that have their own text undo.
  useEffect(() => {
    if (!data) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || isForeignTextField(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        setCopied(false);
        dispatch({ type: "undo" });
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        setCopied(false);
        dispatch({ type: "redo" });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [data]);

  const handlePaste = (e: ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const raw =
      e.clipboardData.getData("application/json") || e.clipboardData.getData("text/plain");
    const result = parseWebflowClipboard(raw);

    if (!result.ok) {
      setError(result.error);
      setData(null);
      return;
    }
    setError("");
    setCopied(false);
    setData(result.data);
    dispatch({ type: "load", names: initialNames(result.data) });
  };

  /** Every change to the names invalidates the "Copied!" confirmation. */
  const change = (action: Parameters<typeof dispatch>[0]) => {
    setCopied(false);
    dispatch(action);
  };

  const copy = () => {
    if (!data || invalid.size > 0) return;
    setCopied(copyToWebflow(applyNames(data, names)));
  };

  return {
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
    rename: (styleId: string, value: string) => change({ type: "rename", styleId, value }),
    replaceAll: (find: string, replacement: string) =>
      change({ type: "replace", find, replacement }),
    resetClass: (styleId: string) => change({ type: "reset", styleIds: [styleId], originals }),
    resetAll: () => change({ type: "reset", styleIds: Object.keys(originals), originals }),
    undo: (entryId?: number) => change({ type: "undo", entryId }),
    redo: (entryId?: number) => change({ type: "redo", entryId }),
  };
}
