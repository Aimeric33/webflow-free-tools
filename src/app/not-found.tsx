import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-start justify-center gap-4 pt-20">
      <Eyebrow>404</Eyebrow>
      <h1>This page doesn&apos;t exist.</h1>
      <p className="max-w-lg">The link may be broken, or the page may have moved.</p>
      <Button href="/" className="mt-2">
        Back to home
      </Button>
    </section>
  );
}
