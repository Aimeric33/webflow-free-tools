import type { NameMap } from "../types";
import { replaceInNames } from "./replace";

/** One class name change inside a history entry. */
export type Edit = { styleId: string; before: string; after: string };

export type HistoryEntry =
  | {
      id: number;
      kind: "rename";
      edits: [Edit];
      undone: boolean;
      appliedAt: number;
      undoneAt: number;
    }
  | {
      id: number;
      kind: "replace";
      find: string;
      replacement: string;
      edits: Edit[];
      undone: boolean;
      appliedAt: number;
      undoneAt: number;
    }
  | {
      id: number;
      kind: "reset";
      edits: Edit[];
      undone: boolean;
      appliedAt: number;
      undoneAt: number;
    };

/** Omit applied to each member of a union, so variant-specific fields are kept. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type HistoryState = {
  names: NameMap;
  /** Oldest first. */
  entries: HistoryEntry[];
  /** Logical clock, bumped on every action, used to order undo / redo. */
  clock: number;
};

export type HistoryAction =
  | { type: "load"; names: NameMap }
  | { type: "rename"; styleId: string; value: string }
  | { type: "replace"; find: string; replacement: string }
  | { type: "reset"; styleIds: string[]; originals: NameMap }
  | { type: "undo"; entryId?: number }
  | { type: "redo"; entryId?: number };

export const emptyHistory: HistoryState = { names: {}, entries: [], clock: 0 };

/** An entry can be undone while every class it touched still holds the value it set. */
export function canUndo(entry: HistoryEntry, names: NameMap) {
  return !entry.undone && entry.edits.every((e) => names[e.styleId] === e.after);
}

/** An entry can be redone while every class it touched is still back to its previous value. */
export function canRedo(entry: HistoryEntry, names: NameMap) {
  return entry.undone && entry.edits.every((e) => names[e.styleId] === e.before);
}

function apply(names: NameMap, edits: Edit[], side: "before" | "after"): NameMap {
  const next = { ...names };
  for (const edit of edits) next[edit.styleId] = edit[side];
  return next;
}

/** Diff two name maps into edits. */
function diff(before: NameMap, after: NameMap): Edit[] {
  return Object.keys(after)
    .filter((id) => before[id] !== after[id])
    .map((id) => ({ styleId: id, before: before[id] ?? "", after: after[id] ?? "" }));
}

/** Records a new entry. A new change discards undone entries, like any editor's redo stack. */
function record(
  state: HistoryState,
  entry: DistributiveOmit<HistoryEntry, "id" | "undone" | "appliedAt" | "undoneAt">,
): HistoryState {
  const clock = state.clock + 1;
  const full = {
    ...entry,
    id: clock,
    undone: false,
    appliedAt: clock,
    undoneAt: 0,
  } as HistoryEntry;
  return {
    names: apply(state.names, full.edits, "after"),
    entries: [...state.entries.filter((e) => !e.undone), full],
    clock,
  };
}

function pick(
  entries: HistoryEntry[],
  ok: (e: HistoryEntry) => boolean,
  by: "appliedAt" | "undoneAt",
) {
  return entries.filter(ok).sort((a, b) => b[by] - a[by])[0];
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "load":
      return { names: action.names, entries: [], clock: 0 };

    case "rename": {
      const { styleId, value } = action;
      const current = state.names[styleId] ?? "";
      if (current === value) return state;

      // Typing in the same input extends the last entry instead of creating one per keystroke.
      const last = state.entries.at(-1);
      if (
        last?.kind === "rename" &&
        !last.undone &&
        last.appliedAt === state.clock &&
        last.edits[0].styleId === styleId
      ) {
        const edit = { ...last.edits[0], after: value };
        const entries =
          edit.after === edit.before
            ? state.entries.slice(0, -1)
            : [...state.entries.slice(0, -1), { ...last, edits: [edit] as [Edit] }];
        return { ...state, names: { ...state.names, [styleId]: value }, entries };
      }

      return record(state, { kind: "rename", edits: [{ styleId, before: current, after: value }] });
    }

    case "replace": {
      const edits = diff(state.names, replaceInNames(state.names, action.find, action.replacement));
      if (edits.length === 0) return state;
      return record(state, {
        kind: "replace",
        find: action.find,
        replacement: action.replacement,
        edits,
      });
    }

    case "reset": {
      const edits = action.styleIds
        .filter(
          (id) => action.originals[id] !== undefined && state.names[id] !== action.originals[id],
        )
        .map((id) => ({
          styleId: id,
          before: state.names[id] ?? "",
          after: action.originals[id] ?? "",
        }));
      if (edits.length === 0) return state;
      return record(state, { kind: "reset", edits });
    }

    case "undo": {
      const entry =
        action.entryId === undefined
          ? pick(state.entries, (e) => canUndo(e, state.names), "appliedAt")
          : state.entries.find((e) => e.id === action.entryId && canUndo(e, state.names));
      if (!entry) return state;
      const clock = state.clock + 1;
      return {
        names: apply(state.names, entry.edits, "before"),
        entries: state.entries.map((e) =>
          e === entry ? { ...e, undone: true, undoneAt: clock } : e,
        ),
        clock,
      };
    }

    case "redo": {
      const entry =
        action.entryId === undefined
          ? pick(state.entries, (e) => canRedo(e, state.names), "undoneAt")
          : state.entries.find((e) => e.id === action.entryId && canRedo(e, state.names));
      if (!entry) return state;
      const clock = state.clock + 1;
      return {
        names: apply(state.names, entry.edits, "after"),
        entries: state.entries.map((e) =>
          e === entry ? { ...e, undone: false, appliedAt: clock } : e,
        ),
        clock,
      };
    }
  }
}
