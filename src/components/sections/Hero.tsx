import Image from "next/image";

import heroImage from "@/assets/wcr_home_hero.webp";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <Eyebrow accent>Free tools for Webflow developers</Eyebrow>
      <h1 className="mt-6 max-w-4xl text-2xl sm:text-3xl">
        Rename Webflow classes in seconds. Paste. Rename. Copy back.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-secondary">
        Paste any Webflow element, rename every class in one place, and copy it back to the
        Designer. No more clicking through the Style panel one class at a time.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button href="/renamer">Rename classes for free</Button>
        <Eyebrow>Always free · No account required</Eyebrow>
      </div>
      <div className="mt-16 border border-border">
        <Image
          src={heroImage}
          alt="Example of Webflow classes renamed with this tool"
          preload
          placeholder="blur"
          sizes="(min-width: 72rem) 68rem, calc(100vw - 2.5rem)"
          className="aspect-2/1 w-full object-cover"
        />
      </div>
    </section>
  );
}
