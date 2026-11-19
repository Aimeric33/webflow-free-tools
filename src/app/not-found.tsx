import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-start justify-center py-16">
      <Eyebrow accent>Error 404</Eyebrow>
      <h1 className="mt-6 text-2xl sm:text-3xl">This page doesn&apos;t exist.</h1>
      <p className="mt-6 max-w-xl text-lg text-secondary">
        The link may be broken, or the page may have moved.
      </p>
      <Button href="/" className="mt-8">
        Back to home
      </Button>
    </section>
  );
}
