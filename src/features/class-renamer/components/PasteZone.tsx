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
    <kbd className="border border-border px-2 font-mono text-xs text-muted-foreground">
      {children}
    </kbd>
  );
}

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

function CheckIcon() {
  return (
    <svg {...iconProps} width="16" height="16" strokeWidth={2.2}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg {...iconProps} width="24" height="24">
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg {...iconProps} width="24" height="24">
      <rect x="6" y="4" width="12" height="17" />
      <path d="M9 4V2h6v2" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}

function PastedSummary({ data, onPaste }: { data: XscpData; onPaste: PasteHandler }) {
  const { rootTag, elementCount, classCount } = summarize(data);
  const stats = [
    { label: "Root", value: rootTag ?? "-" },
    { label: "Elements", value: elementCount },
    { label: "Classes", value: classCount },
  ];

  return (
    <section className="flex flex-col gap-4 border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center border border-border text-foreground">
          <CheckIcon />
        </span>
        <div role="status">
          <p className="font-semibold text-foreground">Webflow element detected</p>
          <p className="font-mono text-xs text-muted-foreground">Pasted just now</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 border border-border">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 border-l border-border px-3 py-3 first:border-l-0">
            <dt className="font-mono text-xs tracking-eyebrow text-muted-foreground uppercase">
              {s.label}
            </dt>
            <dd className="mt-1 truncate font-mono text-foreground">{s.value}</dd>
          </div>
        ))}
      </dl>

      <label className="relative flex min-h-12 items-center justify-between border border-dashed border-border-strong px-4 text-sm text-secondary transition-colors hover:border-foreground hover:text-foreground">
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
      className={`relative flex min-h-96 min-w-0 cursor-text flex-col items-center justify-center gap-4 border border-dashed bg-background p-8 text-center transition-colors ${
        error ? "border-danger" : "border-border-strong hover:border-foreground"
      }`}
    >
      <span
        className={`grid size-12 place-items-center border ${
          error ? "border-danger text-danger" : "border-border text-foreground"
        }`}
      >
        {error ? <AlertIcon /> : <ClipboardIcon />}
      </span>

      <span className="text-lg font-semibold tracking-tight text-foreground">
        {error ? "This isn't a Webflow element" : "Paste your Webflow element here"}
      </span>

      {error ? (
        <span role="alert" className="max-w-xs text-xs text-danger">
          {error}
        </span>
      ) : (
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Kbd>⌘ V</Kbd> or <Kbd>Ctrl V</Kbd>
        </span>
      )}
      <PasteTarget onPaste={onPaste} />
    </label>
  );
}
