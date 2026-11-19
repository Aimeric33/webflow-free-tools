import type { ClipboardEvent, ReactNode } from "react";

import { summarize } from "../lib/webflow";
import type { XscpData } from "../types";

type PasteHandler = (e: ClipboardEvent<HTMLElement>) => void;

/**
 * Invisible textarea covering its parent label: it gives the zone a real focus target
 * so ⌘V / Ctrl V fires a native paste event we can read rich MIME types from.
 */
function PasteTarget({ onPaste }: { onPaste: PasteHandler }) {
  return (
    <textarea
      aria-label="Paste area"
      value=""
      readOnly
      onPaste={onPaste}
      className="absolute inset-0 size-full cursor-text resize-none border-0 opacity-0"
    />
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-muted">
      {children}
    </kbd>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}

function PastedSummary({ data, onPaste }: { data: XscpData; onPaste: PasteHandler }) {
  const { rootTag, elementCount, classCount } = summarize(data);
  const stats = [
    { label: "Root", value: rootTag ?? "—" },
    { label: "Elements", value: elementCount },
    { label: "Classes", value: classCount },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <CheckIcon />
        </span>
        <div role="status">
          <p className="font-sans font-medium text-heading">Webflow element detected</p>
          <p className="text-xs text-muted">Pasted just now</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-md bg-surface-2 px-3 py-2.5">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-0.5 truncate text-heading">{s.value}</dd>
          </div>
        ))}
      </dl>

      <label className="relative flex min-h-11 items-center justify-between rounded-md border border-dashed border-white/15 px-3.5 transition-colors hover:border-primary/40">
        Paste another element
        <Kbd>⌘ V</Kbd>
        <PasteTarget onPaste={onPaste} />
      </label>
    </section>
  );
}

type PasteZoneProps = {
  data: XscpData | null;
  error: string;
  onPaste: PasteHandler;
};

export function PasteZone({ data, error, onPaste }: PasteZoneProps) {
  if (data) return <PastedSummary data={data} onPaste={onPaste} />;

  return (
    <label
      className={`relative flex min-h-100 min-w-0 cursor-text flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-surface p-8 text-center transition-colors ${
        error ? "border-red-400/60" : "border-primary/35"
      }`}
    >
      <span
        className={`grid size-14 place-items-center rounded-[14px] ${
          error ? "bg-red-400/10 text-red-400" : "bg-primary/10 text-primary"
        }`}
      >
        {error ? <AlertIcon /> : <ClipboardIcon />}
      </span>

      <span className="font-sans text-lg font-medium text-heading">
        {error ? "This isn't a Webflow element" : "Paste your Webflow element here"}
      </span>

      {error ? (
        <span role="alert" className="max-w-70 text-xs text-red-400">
          {error}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Kbd>⌘ V</Kbd> or <Kbd>Ctrl V</Kbd>
        </span>
      )}
      <PasteTarget onPaste={onPaste} />
    </label>
  );
}
