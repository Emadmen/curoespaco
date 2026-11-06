"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { LogoMark } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SplitTitle } from "@/components/shared/split-text";

const initials = (name: string) => name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();

/** The person's photograph, or a tile with their initials when there is none. */
function Tile({ author, photo, className }: { author: string; photo?: string; className?: string }) {
  return (
    <div
      key={author}
      aria-hidden="true"
      className={cn("relative grid place-items-center overflow-hidden rounded-xl animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none", className)}
    >
      {photo ? <Image src={photo} alt="" fill sizes="(min-width: 1024px) 16rem, 5rem" className="object-cover object-[50%_25%]" /> : initials(author)}
    </div>
  );
}

/** One testimonial at a time, with the ones either side waiting at the edges. */
export function TestimonialsCarousel({ items, sample = false }: { items: Pick<Testimonial, "id" | "quote" | "author" | "photo">[]; sample?: boolean }) {
  const [index, setIndex] = useState(0);
  const at = (offset: number) => items[(index + offset + items.length) % items.length];
  const several = items.length > 1;

  return (
    <Section space="none" aria-labelledby="testimonials-title" className="pt-26 pb-16 lg:pb-10">
      <div className="text-center">
        <Reveal className="flex justify-center">
          <p className="eyebrow">
            <LogoMark className="h-2" />
            {t.testimonials.eyebrow}
          </p>
        </Reveal>
        <SplitTitle id="testimonials-title" className="mx-auto mt-5 max-w-[16em] text-balance type-display-md font-light">
          {t.testimonials.title}
        </SplitTitle>
      </div>

      <Reveal delay={0.15} className="mt-10 grid gap-5 lg:mt-12 lg:h-[clamp(20rem,calc(100svh-24rem),26rem)] lg:grid-cols-[9rem_16rem_1fr_9rem] lg:grid-rows-2">
        {several && <Tile key={at(-1).id} author={at(-1).author} photo={at(-1).photo} className="bg-sand-200 text-xl max-lg:hidden" />}
        <Tile key={items[index].id} author={items[index].author} photo={items[index].photo} className="ember size-20 text-2xl font-light text-forest-900 lg:row-span-2 lg:size-auto lg:text-5xl" />

        <div className="grid lg:row-span-2 lg:px-6" aria-live="polite">
          {items.map((item, i) => (
            <figure
              key={item.id}
              aria-hidden={i !== index}
              className={cn(
                "flex flex-col [grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none",
                i === index ? "opacity-100" : "invisible opacity-0",
              )}
            >
              <Quote aria-hidden="true" className="size-9 rotate-180 text-coral-500" strokeWidth={1} />
              <blockquote className="mt-4 text-xl leading-relaxed lg:text-2xl lg:leading-snug">{item.quote}</blockquote>
              <figcaption className="mt-6 lg:mt-auto">
                <span className="block text-lg">{item.author}</span>
                {sample && <span className="text-sm text-muted-foreground">{t.testimonials.sampleNote}</span>}
              </figcaption>
            </figure>
          ))}
        </div>

        {several && <Tile key={at(1).id} author={at(1).author} photo={at(1).photo} className="col-start-4 row-start-2 bg-sand-200 text-xl max-lg:hidden" />}
      </Reveal>

      {several && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.6} />
            {t.testimonials.previous}
          </button>
          <div className="flex items-center">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${t.testimonials.show} ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="grid h-11 min-w-8 place-items-center px-1"
              >
                <span className={cn("block h-1 rounded-full transition-all duration-500", i === index ? "w-6 bg-foreground" : "w-2 bg-foreground/20")} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            className="inline-flex min-h-11 items-center gap-2 text-sm transition-colors hover:text-muted-foreground"
          >
            {t.testimonials.next}
            <ArrowRight className="size-4" strokeWidth={1.6} />
          </button>
        </div>
      )}
    </Section>
  );
}
