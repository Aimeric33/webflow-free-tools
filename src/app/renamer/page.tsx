import type { Metadata } from "next";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { ClassRenamer } from "@/features/class-renamer";

export const metadata: Metadata = {
  title: "Webflow Classes Renamer",
  description:
    "Paste any Webflow element, rename every class in one place, and copy it back to the Designer.",
  alternates: { canonical: "/renamer" },
};

export default function RenamerPage() {
  return (
    <>
      <section className="border-b border-border py-16">
        <Eyebrow accent>Webflow Classes Renamer</Eyebrow>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="max-w-xl text-2xl sm:text-3xl">
            Paste. Rename classes. Copy back in Webflow.
          </h1>
          <p className="max-w-md text-secondary">
            Paste any Webflow element, rename every class in one place, and copy it back to the
            Designer. No more clicking through the Style panel one class at a time.
          </p>
        </div>
      </section>
      <section aria-label="Classes renamer" className="py-12">
        <ClassRenamer />
      </section>
    </>
  );
}
