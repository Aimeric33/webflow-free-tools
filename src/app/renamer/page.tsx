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
      <section className="pt-28 pb-14">
        <Eyebrow dotColor="bg-white">Webflow Classes Renamer</Eyebrow>
        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row">
          <h1 className="max-w-lg">Paste. Rename Classes. Copy back in Webflow.</h1>
          <p className="max-w-md">
            Paste any Webflow element, rename every class in one place, and copy it back to the
            Designer. No more clicking through the Style panel one class at a time.
          </p>
        </div>
        <hr className="border-white/30" />
      </section>
      <ClassRenamer />
    </>
  );
}
