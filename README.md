# Webflow Classes Renamer

A free tool for Webflow developers: paste any Webflow element, rename every class in one place, and copy it back to the Designer. No more clicking through the Style panel one class at a time.

Part of **FacetsDev**, a set of free tools for Webflow developers.

## How it works

1. In the Webflow Designer, copy an element (⌘C).
2. Paste it on `/renamer` (⌘V). The element tree appears with an input for each class.
3. Rename classes. Empty names and duplicate base classes are flagged before anything is copied.
4. Click **Copy for Webflow**, then paste back in the Designer.

Everything happens in the browser. Nothing is sent to a server.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19
- TypeScript in strict mode (`noUncheckedIndexedAccess` included)
- [Tailwind CSS v4](https://tailwindcss.com) with design tokens declared in `@theme`
- ESLint (`eslint-config-next`: core-web-vitals + TypeScript), Prettier with the Tailwind plugin
- GitHub Actions: lint, typecheck, format check and build on every push and pull request

## Getting started

Requires Node.js 20.9+ (`.nvmrc` pins the version used in CI).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script                 | Purpose                       |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start the dev server          |
| `npm run build`        | Production build              |
| `npm run start`        | Serve the production build    |
| `npm run lint`         | ESLint                        |
| `npm run typecheck`    | TypeScript, no emit           |
| `npm run format`       | Format with Prettier          |
| `npm run format:check` | Check formatting (used in CI) |

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the deployed URL. It is used for canonical URLs, Open Graph metadata and the sitemap.

## Project structure

```
src/
├── app/                      # Routes, root layout, metadata, fonts, sitemap/robots
│   ├── layout.tsx
│   ├── page.tsx              # Home
│   ├── renamer/page.tsx      # The tool
│   └── not-found.tsx
├── components/
│   ├── layout/               # Header, mobile menu, logo, active nav link
│   ├── sections/             # Page sections (Hero)
│   └── ui/                   # Small reusable primitives (Button, Eyebrow)
├── config/site.ts            # Site name, description, URL, navigation
├── features/class-renamer/   # Self-contained feature, exposed through index.ts
│   ├── ClassRenamer.tsx      # The only client island of the tool
│   ├── hooks/useClassRenamer.ts
│   ├── components/           # PasteZone, ClassesPanel, Node
│   ├── lib/webflow.ts        # Pure functions: parse, build tree, validate, apply names
│   └── types.ts              # Types for Webflow's clipboard format
└── assets/                   # Fonts and images, imported so Next.js can optimize them
```

## Technical notes

- **Server components by default.** Pages, the header and the hero render on the server and are prerendered as static HTML. Only the interactive parts are client components: the renamer, the mobile menu and the active nav link.
- **Feature folder.** Everything about the renamer lives in `features/class-renamer`. The UI imports it only through its `index.ts`. The parsing and validation logic in `lib/webflow.ts` is pure and independent of React.
- **Webflow's clipboard format.** The Designer copies elements as JSON of type `@webflow/XscpData` under the `application/json` MIME type. Renaming only changes `style.name`. Style ids stay the same, so every node keeps pointing at its classes. Unknown fields are preserved so the payload goes back to Webflow intact.
- **Why `document.execCommand("copy")`.** Webflow only reads `application/json` on paste, and `navigator.clipboard.writeText()` can only write `text/plain`. Hooking the `copy` event and triggering it with `execCommand` is the only way to set that MIME type synchronously from a click.
- **Fonts and images.** Geist is self-hosted with `next/font/local` (preloaded, no layout shift). The hero uses `next/image` with a blur placeholder and responsive `sizes`.
- **Accessibility.** Skip link, `aria-current` on nav links, `aria-pressed` filters, `aria-invalid` on invalid class inputs, and live regions for paste errors and the copy confirmation. The text color on the primary button meets WCAG AA contrast.
- **TypeScript version.** TypeScript is pinned to 6.0.x because `typescript-eslint`, which `eslint-config-next` uses, does not support TypeScript 7 yet.
