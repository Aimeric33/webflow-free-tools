import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground"
        >
          <Logo className="w-6" />
          <span>{siteConfig.name}</span>
          <span className="sr-only">Home</span>
        </Link>

        <nav aria-label="Global" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="text-secondary hover:text-foreground aria-[current=page]:text-foreground"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu items={siteConfig.nav} />
      </div>
    </header>
  );
}
