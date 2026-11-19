import { useId, useMemo, useRef, useState, type FormEvent } from "react";

import { countMatches, findRepeatedTokens } from "../lib/replace";
import type { NameMap } from "../types";

type ReplaceBarProps = {
  names: NameMap;
  onReplace: (find: string, replacement: string) => void;
};

const inputClass =
  "h-10 w-full min-w-0 border border-border bg-background px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";

export function ReplaceBar({ names, onReplace }: ReplaceBarProps) {
  const [find, setFind] = useState("");
  const [replacement, setReplacement] = useState("");
  const replaceInput = useRef<HTMLInputElement>(null);
  const headingId = useId();

  const suggestions = useMemo(() => findRepeatedTokens(Object.values(names)), [names]);
  const matches = useMemo(() => countMatches(names, find), [names, find]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!find || matches === 0) return;
    onReplace(find, replacement);
    setFind("");
    setReplacement("");
  };

  const pick = (token: string) => {
    setFind(token);
    replaceInput.current?.focus();
  };

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 border border-border bg-background p-4"
    >
      <h2 id={headingId} className="text-base">
        Find &amp; replace
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-xs tracking-eyebrow text-muted-foreground uppercase">
            Find
          </span>
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="e.g. header57"
            spellCheck={false}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-xs tracking-eyebrow text-muted-foreground uppercase">
            Replace with
          </span>
          <input
            ref={replaceInput}
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="e.g. hero"
            spellCheck={false}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <div className="flex flex-col">
          <button
            type="submit"
            disabled={!find || matches === 0}
            className="h-10 border border-border-strong px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Replace all
          </button>
        </div>
      </form>

      <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
        {find
          ? `${matches} ${matches === 1 ? "class contains" : "classes contain"} "${find}"`
          : "Case-insensitive. Applies to every class, including combo classes."}
      </p>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="mr-2 font-mono text-xs tracking-eyebrow text-muted-foreground uppercase">
            Repeated
          </span>
          {suggestions.map(({ token, count }) => (
            <button
              key={token}
              type="button"
              onClick={() => pick(token)}
              aria-pressed={find.toLowerCase() === token}
              className="flex items-center gap-2 border border-border px-2 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted aria-pressed:border-foreground"
            >
              {token}
              <span className="text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
