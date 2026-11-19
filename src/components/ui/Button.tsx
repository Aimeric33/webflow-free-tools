import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Link>;

/** Primary call-to-action rendered as a link (all current CTAs navigate). */
export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <Link
      className={`inline-block rounded-sm bg-white px-4 py-2 text-sm font-medium text-black ring-2 ring-transparent transition-shadow duration-500 ease-out hover:text-black hover:ring-gray-400 ${className}`}
      {...props}
    />
  );
}
