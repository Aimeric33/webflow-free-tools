import Image from "next/image";

import heroImage from "@/assets/wcr_home_hero.webp";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section className="pt-20">
      <Eyebrow dotColor="bg-white">Free tools for Webflow developers</Eyebrow>
      <h1 className="mt-4">
        Rename Webflow classes in seconds. <br />
        Paste. Rename. Copy back.
      </h1>
      <p className="max-w-lg">
        Paste any Webflow element, rename every class in one place, and copy it back to the
        Designer. No more clicking through the Style panel one class at a time.
      </p>
      <Button href="/renamer" className="mt-6">
        Rename classes for free
      </Button>
      <div className="mt-3">
        <Eyebrow>Always free · No account required</Eyebrow>
      </div>
      <Image
        src={heroImage}
        alt="Example of Webflow classes renamed with this tool"
        preload
        placeholder="blur"
        sizes="(min-width: 80rem) 76rem, calc(100vw - 2rem)"
        className="mt-12 aspect-2/1 w-full object-cover"
      />
    </section>
  );
}
