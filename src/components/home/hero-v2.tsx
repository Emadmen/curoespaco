"use client";

import Image from "next/image";
import { useRef } from "react";
import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import { EASE, gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import type { ClinicInfo } from "@/types";
import { BookLink } from "@/components/shared/book-link";
import { Reveal } from "@/components/shared/reveal";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";

/*
 * TEMPORARY: the hero for UI template 2. A big uppercase headline with a photograph set
 * into it like a word, a small tilted tag, then a mosaic of soft rounded tiles: the middle
 * ones are windows onto one photograph, the outer ones plain colour.
 */

const W = 1000;
const H = 620;

/** A rectangle with its own radius at each corner: top-left, top-right, bottom-right, bottom-left. */
function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: readonly number[]) {
  return [
    `M${x + tl} ${y}`,
    `H${x + w - tr}`,
    `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`,
    `V${y + h - br}`,
    `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}`,
    `H${x + bl}`,
    `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`,
    `V${y + tl}`,
    `A${tl} ${tl} 0 0 1 ${x + tl} ${y}`,
    "Z",
  ].join(" ");
}

type Tile = { x: number; y: number; w: number; h: number; r: readonly number[]; photo?: boolean; fill?: string };

/** Five columns, wider in the middle and shorter at the edges, so the whole reads as one rounded shape. */
const TILES: Tile[] = [
  { x: 0, y: 200, w: 150, h: 240, r: [75, 22, 22, 75], fill: "var(--v2-honey)" },
  { x: 165, y: 45, w: 170, h: 140, r: [90, 50, 22, 22], fill: "var(--v2-caramel)" },
  { x: 165, y: 200, w: 170, h: 270, r: [60, 22, 22, 60], photo: true },
  { x: 175, y: 485, w: 160, h: 135, r: [22, 22, 22, 80], fill: "var(--v2-silver)" },
  { x: 350, y: 0, w: 300, h: 185, r: [150, 150, 22, 22], photo: true },
  { x: 350, y: 200, w: 300, h: 270, r: [22, 22, 22, 22], photo: true },
  { x: 350, y: 485, w: 300, h: 135, r: [22, 22, 120, 120], photo: true },
  { x: 665, y: 45, w: 170, h: 140, r: [50, 90, 22, 22], fill: "var(--v2-silver)" },
  { x: 665, y: 200, w: 170, h: 270, r: [22, 60, 60, 22], photo: true },
  { x: 665, y: 485, w: 160, h: 135, r: [22, 22, 80, 22], fill: "var(--v2-honey)" },
  { x: 850, y: 200, w: 150, h: 240, r: [22, 75, 75, 22], fill: "var(--v2-caramel)" },
];

/** The photograph is shot from above, upside down; it is turned and placed so the face sits in the middle tiles. */
const PHOTO = { src: "/images/home/statement.jpg", x: 150, width: 700, height: 1050, y: -80 };

function Sparkle({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 0C12.6 7.2 16.8 11.4 24 12C16.8 12.6 12.6 16.8 12 24C11.4 16.8 7.2 12.6 0 12C7.2 11.4 11.4 7.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

function Mosaic() {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const tiles = gsap.utils.toArray<SVGElement>("[data-tile]", ref.current);
        gsap.from(tiles, {
          opacity: 0,
          scale: 0.86,
          transformOrigin: "50% 50%",
          duration: 1.2,
          ease: EASE,
          delay: 0.5,
          stagger: { each: 0.06, from: "center" },
        });
      });
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.heroV2.mosaicAlt} className="block h-auto w-full">
      <defs>
        {TILES.map((tile, i) =>
          tile.photo ? (
            <clipPath key={i} id={`hero-v2-tile-${i}`}>
              <path d={roundedRect(tile.x, tile.y, tile.w, tile.h, tile.r)} />
            </clipPath>
          ) : null,
        )}
      </defs>
      {TILES.map((tile, i) =>
        tile.photo ? (
          // Each window shows its own part of the same photograph, so the tiles can arrive one by one.
          <g key={i} data-tile="" clipPath={`url(#hero-v2-tile-${i})`}>
            <image
              href={PHOTO.src}
              x={PHOTO.x}
              y={PHOTO.y}
              width={PHOTO.width}
              height={PHOTO.height}
              preserveAspectRatio="xMidYMid slice"
              transform={`rotate(180 ${PHOTO.x + PHOTO.width / 2} ${PHOTO.y + PHOTO.height / 2})`}
            />
          </g>
        ) : (
          <path key={i} data-tile="" d={roundedRect(tile.x, tile.y, tile.w, tile.h, tile.r)} style={{ fill: tile.fill }} />
        ),
      )}
    </svg>
  );
}

export function HeroV2({ clinic }: { clinic: ClinicInfo }) {
  const [first, second] = t.heroV2.lines;

  return (
    <section
      aria-labelledby="hero-v2-title"
      className="relative -mt-[4.5rem] overflow-hidden bg-linear-to-b from-white from-75% to-background pt-28 pb-16 text-(--v2-cocoa) lg:-mt-20 lg:pt-36"
    >
      <Sparkle className="absolute top-[38%] left-[4%] size-8 text-(--v2-caramel) sm:size-12" />
      <Sparkle className="absolute top-[22%] right-[6%] size-5 text-(--v2-leaf) sm:size-7" />
      <Sparkle className="absolute right-[10%] bottom-[18%] size-4 text-(--v2-caramel) sm:size-6" />
      <Sparkle className="absolute bottom-[30%] left-[12%] size-3 text-(--v2-leaf) max-sm:hidden" />

      <div className="container-page relative text-center">
        <Reveal immediate delay={0.1}>
          <h1
            id="hero-v2-title"
            className="mx-auto text-[clamp(2.4rem,0.6rem+6.4vw,6.75rem)] leading-[1.02] font-normal tracking-[-0.035em] uppercase"
          >
            <span className="block">{first}</span>
            <span className="block">
              {second}{" "}
              <span className="relative inline-block h-[0.78em] w-[1.9em] translate-y-[0.04em] overflow-hidden rounded-full align-baseline">
                <Image src="/images/home/steps.jpg" alt={t.heroV2.pillAlt} fill sizes="13rem" className="object-cover object-[60%_55%]" />
              </span>
            </span>
          </h1>
        </Reveal>

        <Reveal immediate delay={0.4} className="mt-4 flex justify-center sm:mt-5">
          <p className="-rotate-3 border border-(--v2-cocoa) bg-white px-5 py-1.5 text-base italic sm:translate-x-[30%] sm:text-lg">
            {t.heroV2.tag}
          </p>
        </Reveal>

        <Reveal immediate delay={0.6} className="mt-8 flex items-center justify-center gap-3 max-[359px]:flex-col max-[359px]:items-stretch">
          <BookLink size="lg" className="bg-(--v2-cocoa) text-(--v2-cream) hover:bg-(--v2-cocoa)/85 max-sm:min-w-0 max-sm:flex-1 max-sm:px-4" />
          <WhatsAppLink
            size="lg"
            number={clinic.whatsapp}
            message={whatsappMessages.general()}
            label={t.cta.whatsappLong}
            shortLabel={t.cta.whatsapp}
            className="border-(--v2-cocoa)/40 text-(--v2-cocoa) hover:bg-(--v2-cocoa) hover:text-(--v2-cream) max-sm:min-w-0 max-sm:flex-1 max-sm:px-4"
          />
        </Reveal>

        <div className="mx-auto mt-10 max-w-5xl lg:mt-12">
          <Mosaic />
        </div>
      </div>
    </section>
  );
}
