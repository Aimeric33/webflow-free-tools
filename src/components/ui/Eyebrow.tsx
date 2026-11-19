import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  /** Tailwind background class for the leading pill. */
  dotColor?: string;
};

export function Eyebrow({ children, dotColor = "bg-primary" }: EyebrowProps) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-2 w-4 rounded-full ${dotColor}`} />
      <p className="text-xs">{children}</p>
    </div>
  );
}
