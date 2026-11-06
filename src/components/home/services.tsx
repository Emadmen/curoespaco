"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import type { PublicService } from "@/types";
import { LogoMark } from "@/components/shared/logo";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SplitTitle } from "@/components/shared/split-text";
import { ServiceIcon } from "@/components/services/service-icon";

/** One service around the photograph. The whole card opens the service's page. */
function ServiceTile({
  service,
  active,
  onActive,
  index,
}: {
  service: PublicService;
  active: boolean;
  onActive: () => void;
  index: number;
}) {
  return (
    <Reveal delay={0.1 + index * 0.08}>
      <article
        onPointerEnter={onActive}
        onFocus={onActive}
        className={cn(
          "relative flex h-full flex-col justify-between gap-6 rounded-lg border border-white/5 p-5 transition-colors duration-500 motion-reduce:transition-none",
          active ? "bg-white/8" : "bg-white/3",
        )}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/8">
          <ServiceIcon name={service.icon} className="size-4" />
        </span>
        <div>
          <h3 className="text-xl font-light tracking-tight lg:text-2xl">
            <Link
              href={`/servicos/${service.slug}`}
              className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-foreground"
            >
              {service.name}
            </Link>
          </h3>
          <p className="text-pretty-p mt-2 text-sm leading-relaxed text-muted-foreground">{service.shortDescription}</p>
          <div
            aria-hidden="true"
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
              active ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs">
                {t.services.more}
                <ArrowUpRight className="size-3.5" strokeWidth={1.6} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** The first services, by the admin's sort order, either side of a photograph. */
export function ServicesSection({ services }: { services: PublicService[] }) {
  const [active, setActive] = useState(0);
  const tiles = services.slice(0, 4);
  const tile = (service: PublicService, i: number) => (
    <ServiceTile key={service.id} service={service} index={i} active={i === active} onActive={() => setActive(i)} />
  );

  return (
    <Section tone="forest" space="none" aria-labelledby="services-title" className="pt-26 pb-16 lg:pb-10">
      <div className="text-center">
        <Reveal className="flex justify-center">
          <p className="eyebrow bg-white/8">
            <LogoMark className="h-2" />
            {t.services.helpEyebrow}
          </p>
        </Reveal>
        <SplitTitle id="services-title" className="mx-auto mt-5 max-w-[20em] text-balance type-display-md font-light">
          {t.services.title}
        </SplitTitle>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:min-h-[clamp(28rem,calc(100svh-19rem),40rem)] lg:grid-flow-col lg:grid-cols-[1fr_2.08fr_1fr] lg:grid-rows-[repeat(2,1fr)]">
        {tiles.slice(0, 2).map(tile)}
        <Reveal variant="image" className="relative overflow-hidden rounded-xl max-lg:order-first max-lg:aspect-[4/3] max-sm:aspect-square sm:max-lg:col-span-2 lg:row-span-2">
          <Parallax from={-4} to={4} className="absolute inset-x-0 -inset-y-[5%]">
            <Image
              src="/images/home/about.jpg"
              alt={t.services.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="origin-top scale-140 object-cover object-[72%_30%] brightness-90 saturate-[0.72]"
            />
          </Parallax>
          <div className="scrim absolute inset-0 opacity-60" />
          <Link
            href="/servicos"
            className="glass absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t.services.all}
            <ArrowUpRight className="size-4" strokeWidth={1.6} />
          </Link>
        </Reveal>
        {tiles.slice(2).map((service, i) => tile(service, i + 2))}
      </div>
    </Section>
  );
}
