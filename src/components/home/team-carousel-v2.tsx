"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import type { PublicProfessional } from "@/types";
import { Reveal } from "@/components/shared/reveal";
import { Portrait } from "@/components/team/portrait";

/*
 * TEMPORARY: the team section for UI template 2. A short title with round arrows beside a
 * row of tall, softly rounded portrait cards that scroll sideways and snap into place.
 */
export function TeamCarouselV2({ clinicName, professionals }: { clinicName: string; professionals: PublicProfessional[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  /** One card (and its gap) at a time. */
  const step = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const arrow = "grid size-14 place-items-center rounded-full border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-(--v2-cocoa)";

  return (
    <section aria-labelledby="team-v2-title" className="bg-white py-20 text-(--v2-cocoa) lg:py-28">
      <div className="container-page grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <Reveal>
          <h2 id="team-v2-title" className="text-balance text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.15] font-light tracking-[-0.02em]">
            <strong className="font-semibold">{clinicName}</strong> – {t.team.title}
          </h2>
          <div className="mt-8 flex gap-3 lg:mt-10">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => step(-1)}
              disabled={edges.start}
              className={cn(arrow, "border-(--v2-cocoa) hover:bg-(--v2-cocoa) hover:text-white disabled:pointer-events-none disabled:border-(--v2-silver) disabled:text-(--v2-silver)")}
            >
              <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Seguinte"
              onClick={() => step(1)}
              disabled={edges.end}
              className={cn(arrow, "border-(--v2-cocoa) hover:bg-(--v2-cocoa) hover:text-white disabled:pointer-events-none disabled:border-(--v2-silver) disabled:text-(--v2-silver)")}
            >
              <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </Reveal>

        {/* On phones the row runs to the screen's edges; scroll-padding keeps snapped cards in line with the text. */}
        <Reveal delay={0.15} className="min-w-0 max-lg:-mx-4 lg:row-span-2">
          <ul
            ref={track}
            onScroll={measure}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] max-lg:scroll-px-4 max-lg:px-4 sm:gap-5 [&::-webkit-scrollbar]:hidden"
          >
            {professionals.map((p, i) => (
              <li key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[min(20rem,42%)]">
                <Link
                  href={`/equipa/${p.slug}`}
                  className="group block rounded-[2rem] outline-none focus-visible:ring-2 focus-visible:ring-(--v2-cocoa) focus-visible:ring-offset-4"
                >
                  <Portrait
                    name={p.name}
                    imageUrl={p.imageUrl}
                    index={i}
                    note={false}
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 44vw, 72vw"
                    className="rounded-[2rem] bg-(--v2-honey) [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]"
                  />
                  <p className="mt-4 text-lg leading-tight font-medium">{p.name}</p>
                  <p className="mt-1 text-sm text-(--v2-cocoa)/65">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.25} className="lg:self-end">
          <p className="max-w-sm text-lg leading-snug font-light text-(--v2-cocoa)/70">{t.team.intro}</p>
          <Link
            href="/equipa"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-(--v2-cocoa) px-6 text-[0.9375rem] font-medium text-white transition-colors hover:bg-(--v2-cocoa)/85"
          >
            {t.cta.meetTeam}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
