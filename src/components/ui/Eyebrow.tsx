import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  /** Shows the blue accent marker. Use on at most one element per section. */
  accent?: boolean;
  className?: string;
};

/** Mono, uppercase label that introduces a section. */
export function Eyebrow({ children, accent = false, className = "" }: EyebrowProps) {
  return (
    <p
      className={`flex items-center gap-2 font-mono text-xs tracking-eyebrow text-muted-foreground uppercase ${className}`}
    >
      {accent && <span aria-hidden="true" className="size-2 bg-primary" />}
      {children}
    </p>
  );
}
