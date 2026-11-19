export const siteConfig = {
  name: "FacetsDev",
  title: "Free tools for Webflow developers",
  description:
    "Paste any Webflow element, rename every class in one place, and copy it back to the Designer. Always free, no account required.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [{ label: "Classes Renamer", href: "/renamer" }],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
