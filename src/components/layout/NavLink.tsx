"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link> & { href: string };

/** Link that exposes the current page to assistive tech via aria-current. */
export function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return <Link href={href} aria-current={isActive ? "page" : undefined} {...props} />;
}
