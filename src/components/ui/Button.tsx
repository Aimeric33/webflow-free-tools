import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-foreground text-background hover:bg-foreground-hover",
  secondary: "border border-border bg-background text-foreground hover:bg-muted",
} as const;

export const buttonBase =
  "inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-colors";

type ButtonProps = ComponentProps<typeof Link> & { variant?: keyof typeof variants };

/** Call-to-action rendered as a link (all current CTAs navigate). */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <Link className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />;
}
