"use client";

import { useState } from "react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import type { PublicProfessional } from "@/types";
import { TextLink } from "@/components/ui/text-link";
import { LogoMark } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SplitTitle } from "@/components/shared/split-text";
import { Portrait } from "@/components/team/portrait";

const MOVE = "duration-700 ease-out motion-reduce:transition-none";

/** The team as portrait strips: the chosen one opens onto their work. */
export function TeamShowcase({ professionals }: { professionals: PublicProfessional[] }) {
  const [active, setActive] = useState(0);

  return (
    <Section space="none" aria-labelledby="team-title" className="pt-26 pb-16 lg:pb-10">
      <div className="text-center">
        <Reveal className="flex justify-center">
          <p className="eyebrow">
            <LogoMark className="h-2" />
            {t.team.eyebrow}
          </p>
        </Reveal>
        <SplitTitle id="team-title" className="mx-auto mt-5 max-w-[20em] text-balance type-display-md font-light">
          {t.team.title}
        </SplitTitle>
      </div>

      <Reveal
        as="ul"
        delay={0.15}
        className="mt-10 flex flex-col gap-2 lg:mt-12 lg:h-[clamp(24rem,calc(100svh-20rem),34rem)] lg:flex-row"
      >
        {professionals.map((p, i) => {
          const open = i === active;
          return (
            <li
              key={p.id}
              onPointerEnter={() => setActive(i)}
              className={cn(
                "relative min-h-0 min-w-0 overflow-hidden rounded-xl transition-[flex-grow,height] lg:basis-0",
                MOVE,
                open ? "tone-forest bg-background text-foreground max-lg:h-[36rem] lg:grow-[7]" : "border max-lg:h-20 lg:grow lg:border-0",
              )}
            >
              {/* On phones a closed card is a row: small portrait, name and role. */}
              {!open && (
                <div className="absolute inset-y-0 right-5 left-24 flex flex-col justify-center lg:hidden">
                  <p className="truncate text-lg font-light tracking-tight">{p.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{p.title}</p>
                </div>
              )}
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden transition-[width,height,filter]",
                  MOVE,
                  open ? "max-lg:h-[42%] lg:w-[48%]" : "grayscale max-lg:inset-y-2 max-lg:left-2 max-lg:w-16 max-lg:rounded-lg",
                  !open && !p.imageUrl && "lg:opacity-40",
                )}
              >
                <Portrait
                  name={p.name}
                  imageUrl={p.imageUrl}
                  index={i}
                  note={false}
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="aspect-auto size-full rounded-none"
                />
                <div className={cn("absolute inset-x-0 bottom-0 bg-linear-to-t from-forest-900/85 to-transparent p-5 pt-16 text-white transition-opacity", MOVE, !open && "opacity-0")}>
                  <h3 className="truncate text-xl font-light tracking-tight">{p.name}</h3>
                </div>
              </div>

              {open ? (
                <div className="absolute flex flex-col p-6 animate-in fade-in duration-700 fill-mode-backwards delay-200 motion-reduce:animate-none max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-0 lg:inset-y-0 lg:right-0 lg:w-[52%]">
                  <p className="text-sm text-muted-foreground">{p.title}</p>
                  <p className="mt-3 line-clamp-6 text-lg leading-snug font-light lg:text-xl">{p.bio}</p>
                  <ul className="mt-auto flex flex-wrap gap-2 pt-4">
                    {p.expertise.map((area) => (
                      <li key={area} className="rounded-lg bg-white/8 px-3 py-1.5 text-xs">
                        {area}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <TextLink href={`/equipa/${p.slug}`} variant="quiet" arrow>
                      {t.team.profile}
                    </TextLink>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`${t.team.show}: ${p.name}`}
                  onClick={() => setActive(i)}
                  className="absolute inset-0 rounded-xl outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                />
              )}
            </li>
          );
        })}
      </Reveal>
    </Section>
  );
}
