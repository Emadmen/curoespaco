"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { LogoMark } from "@/components/shared/logo";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";

const steps = t.howItWorks.steps;

/**
 * The way to a first appointment, with a photograph over the rows. From `lg` it
 * holds on screen while the scroll picks the active row; on smaller screens the
 * rows simply pass, with the same scroll picking the active one.
 */
export function Steps() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 10%",
          end: "bottom bottom",
          onUpdate: ({ progress }) => setActive(Math.min(steps.length - 1, Math.floor(progress * steps.length))),
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-labelledby="steps-title" data-steps-track="" className="relative">
      <div className="flex flex-col justify-center pt-24 pb-16 lg:sticky lg:top-0 lg:min-h-svh lg:pb-8">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">
              <LogoMark className="h-2" />
              {t.howItWorks.eyebrow}
            </p>
          </Reveal>
          <SplitTitle id="steps-title" className="mt-5 max-w-[14em] type-display-md font-light lg:max-w-none">
            {t.howItWorks.title}
          </SplitTitle>

          <div className="relative mt-8">
            <Reveal
              variant="image"
              className="relative mb-3 aspect-[4/3] overflow-hidden sm:aspect-[16/9] rounded-xl lg:absolute lg:top-0 lg:right-[10.5%] lg:z-10 lg:mb-0 lg:aspect-[10/11] lg:h-[calc(75%-0.1875rem)]"
            >
              <Parallax from={-4} to={4} className="absolute inset-x-0 -inset-y-[5%]">
                <Image
                  src="/images/home/steps.jpg"
                  alt={t.howItWorks.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover object-[62%_50%]"
                />
              </Parallax>
            </Reveal>

            <ol className="grid gap-3 lg:h-[clamp(21rem,calc(100svh-16.5rem),36rem)] lg:auto-rows-fr">
              {steps.map(({ title, text }, i) => (
                <li
                  key={title}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "flex items-center rounded-lg border px-5 py-6 transition-colors duration-500 motion-reduce:transition-none lg:px-9 lg:pr-[46%]",
                    i === active ? "border-transparent bg-primary text-primary-foreground" : "border-foreground/6 bg-card",
                  )}
                >
                  <div className="flex gap-2.5">
                    <span className="pt-0.5 text-[0.6875rem] tabular-nums">{`0${i + 1}`}</span>
                    <div>
                      <h3 className="text-xl font-light tracking-tight lg:text-[1.375rem] lg:leading-7">{title}</h3>
                      <p className={cn("mt-1 text-[0.8125rem] leading-5", i !== active && "text-muted-foreground")}>{text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
