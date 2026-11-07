"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import type { PublicService } from "@/types";
import { Reveal } from "@/components/shared/reveal";

/*
 * The home page's services section (first built for UI template 2; template 1 now uses it too). A ruled list on the left; pointing at a
 * service brings up its photograph in the middle and its name, set large, on the right. With
 * no pointer it moves on by itself, and the dots on the far edge show where it is.
 */

/** The site's own photographs, shared round the services in turn. */
const PHOTOS = [
  { src: "/images/home/about.jpg", position: "72% 30%", alt: t.services.imageAlt },
  { src: "/images/home/statement.jpg", position: "50% 62%", flip: true, alt: t.heroV2.mosaicAlt },
  { src: "/images/home/steps.jpg", position: "45% 50%", alt: t.heroV2.pillAlt },
  { src: "/images/home/hero.jpg", position: "50% 50%", alt: t.hero.imageAlt },
] as const;

/**
 * Template 1 (and 3, which re-colours template 1's tokens) uses this section too, in the site's
 * own colours: the template-2 palette variables are pointed at the shared design tokens.
 */
const SITE_PALETTE = {
  "--v2-cocoa": "var(--color-forest-700)",
  "--v2-silver": "var(--color-sage-200)",
  "--v2-honey": "var(--color-sand-200)",
  "--v2-caramel": "var(--color-coral-600)",
  "--v2-leaf": "var(--color-coral-600)",
} as CSSProperties;

const SHOWN = 5;
const INTERVAL = 5000;

/** Three soft dots, the list's bullet and the photograph's ornament. */
function Dots({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("grid w-fit grid-cols-2 gap-1", className)}>
      <span className="size-2 rounded-full bg-current opacity-50" />
      <span className="size-2" />
      <span className="size-2 rounded-full bg-current" />
      <span className="size-2 rounded-full bg-current" />
    </span>
  );
}

export function ServicesV2({ services, palette = "v2" }: { services: PublicService[]; palette?: "v2" | "site" }) {
  const titleId = palette === "site" ? "services-title" : "services-v2-title";
  const items = services.slice(0, SHOWN);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = items[active];

  // Moves on by itself while nobody is pointing at it, unless the visitor prefers less motion.
  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % items.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  if (!current) return null;
  const photoFor = (i: number) => PHOTOS[i % PHOTOS.length];

  return (
    <section
      aria-labelledby={titleId}
      style={palette === "site" ? SITE_PALETTE : undefined}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("py-20 text-(--v2-cocoa) lg:py-28", palette === "site" ? "bg-background" : "bg-white")}
    >
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id={titleId} className="max-w-[16em] text-balance text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.15] font-light tracking-[-0.02em]">
            <strong className="font-semibold">{t.services.helpEyebrow}</strong> – {t.services.title}
          </h2>
          <Link href="/servicos" className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
            {t.services.all}
            <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.6} />
          </Link>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)_auto] lg:gap-12">
          {/* The list. Pointing or focusing picks a service; the link opens its page. */}
          <Reveal as="ul" stagger className="border-b border-(--v2-cocoa)/15 max-lg:order-last">
            {items.map((service, i) => (
              <li
                key={service.id}
                onPointerEnter={() => setActive(i)}
                className="relative border-t border-(--v2-cocoa)/15 first:border-t-0"
              >
                <div data-reveal-item="" className="flex items-start gap-4 py-5">
                  <Dots className={cn("mt-2 shrink-0 transition-colors duration-300", i === active ? "text-(--v2-cocoa)" : "text-(--v2-silver)")} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl leading-tight font-medium tracking-[-0.02em] sm:text-2xl">
                      <Link
                        href={`/servicos/${service.slug}`}
                        onFocus={() => setActive(i)}
                        className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-(--v2-cocoa)"
                      >
                        {service.name}
                      </Link>
                      <sup className="ml-1 align-super text-xs font-normal tracking-normal text-(--v2-cocoa)/60">
                        ({service.durationMinutes} min)
                      </sup>
                    </h3>
                    <p className="mt-1.5 line-clamp-1 text-sm text-(--v2-cocoa)/65">{service.shortDescription}</p>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 size-7 shrink-0 transition-transform duration-300",
                      i === active ? "translate-x-0.5 -translate-y-0.5" : "opacity-60",
                    )}
                    strokeWidth={1.4}
                  />
                </div>
              </li>
            ))}
          </Reveal>

          {/* The photograph: every service's picture is stacked, and the chosen one fades in. */}
          <Reveal variant="image" className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-(--v2-honey) max-sm:aspect-[4/3] max-lg:mx-auto max-lg:w-full max-lg:max-w-md">
            {items.map((service, i) => {
              const photo = photoFor(i);
              return (
                <Image
                  key={service.id}
                  src={photo.src}
                  alt={i === active ? photo.alt : ""}
                  fill
                  sizes="(min-width: 1024px) 26vw, (min-width: 640px) 28rem, 100vw"
                  style={{ objectPosition: photo.position }}
                  className={cn(
                    "object-cover transition-[opacity,scale] duration-700 ease-out motion-reduce:transition-none",
                    "flip" in photo && photo.flip && "rotate-180",
                    i === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                />
              );
            })}
            <Dots className="absolute top-5 right-5 text-white [&>span]:size-3" />
          </Reveal>

          {/* The chosen service, set large. Its key replays the entrance on every change. */}
          <div aria-live="polite" className="flex flex-col items-end text-right max-lg:items-start max-lg:text-left">
            <div key={current.id} className="flex w-full flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none max-lg:items-start">
              <div className="flex flex-wrap justify-end gap-2 max-lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-(--v2-cocoa)/15 px-3 py-1 text-xs">
                  <span aria-hidden="true" className="text-(--v2-leaf)">✳</span>
                  {t.services.duration.replace("{minutes}", String(current.durationMinutes))}
                </span>
                {current.professionalIds.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-(--v2-cocoa)/15 px-3 py-1 text-xs">
                    <span aria-hidden="true" className="text-(--v2-caramel)">✳</span>
                    {current.professionalIds.length} {current.professionalIds.length === 1 ? "profissional" : "profissionais"}
                  </span>
                )}
              </div>
              <p className="mt-6 text-[clamp(1.9rem,1rem+2.6vw,3.25rem)] leading-[1.02] font-normal tracking-[-0.035em] text-balance uppercase">
                {current.name}
              </p>
              <span aria-hidden="true" className="mt-6 block h-px w-3/4 bg-(--v2-cocoa)/15" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-(--v2-cocoa)/70">{current.shortDescription}</p>
              <Link
                href={`/servicos/${current.slug}`}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-(--v2-cocoa) px-5 text-sm font-medium text-white transition-colors hover:bg-(--v2-cocoa)/85"
              >
                {t.services.more}
                <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.6} />
              </Link>
            </div>
          </div>

          {/* Where it is, as dots down the edge. */}
          <div role="tablist" aria-label="Serviços" aria-orientation="vertical" className="flex gap-2 max-lg:order-first max-lg:hidden lg:flex-col">
            {items.map((service, i) => (
              <button
                key={service.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={service.name}
                onClick={() => setActive(i)}
                className="grid size-4 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-(--v2-cocoa)"
              >
                <span
                  className={cn(
                    "block w-1.5 rounded-full transition-all duration-300",
                    i === active ? "h-4 bg-(--v2-cocoa)" : "h-1.5 bg-(--v2-silver)",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
