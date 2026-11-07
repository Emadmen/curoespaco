"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo, PublicProfessional } from "@/types";
import { bookingHref } from "@/components/shared/book-link";
import { LogoMark } from "@/components/shared/logo";
import { MonthCard } from "@/components/home/month-card";
import { Reveal } from "@/components/shared/reveal";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

/*
 * TEMPORARY: the hero for UI template 3. One black-and-white photograph in a white frame,
 * with the frame reaching into its corners: a label top left, the booking button top right
 * and the headline bottom left. Each of those cut-outs meets the photograph with an inverted
 * rounded corner, so frame and photograph read as one piece. A frosted calendar card sits
 * bottom right.
 */

/** The radius of the inverted corners where a cut-out meets the photograph. */
const R = "1.5rem";

/** The frame is the photograph's own white sky, so frame, cut-outs and photograph read as one surface. */
const FRAME = "#ffffff";

/**
 * An inverted rounded corner, in the frame's colour. `at` names the corner of this small
 * square that is filled; the curve is cut from the opposite one.
 */
function Corner({ at, className }: { at: "tl" | "tr" | "bl" | "br"; className?: string }) {
  const centre = { tl: "100% 100%", tr: "0 100%", bl: "100% 0", br: "0 0" }[at];
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute size-(--r)", className)}
      style={{ background: `radial-gradient(circle at ${centre}, transparent calc(var(--r) - 0.5px), var(--frame) var(--r))` }}
    />
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter((word) => /^\p{Lu}/u.test(word) && !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

/** The team, as small round faces set into the headline. Initials stand in for missing photographs. */
/** `inverted` pre-inverts the faces, so the headline's difference blend turns them back. */
function Faces({ professionals, inverted = false }: { professionals: PublicProfessional[]; inverted?: boolean }) {
  if (professionals.length === 0) return null;
  return (
    <Link
      href="/equipa"
      aria-label={t.cta.meetTeam}
      className={cn(
        "mr-[0.2em] inline-flex translate-y-[0.08em] items-center rounded-full align-baseline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        inverted && "invert",
      )}
    >
      {professionals.slice(0, 3).map(({ id, name, imageUrl }, i) => (
        <span
          key={id}
          aria-hidden="true"
          className={cn(
            "relative grid size-[0.82em] place-items-center overflow-hidden rounded-full border-2 border-(--frame) bg-sand-200 grayscale",
            i > 0 && "-ml-[0.22em]",
          )}
        >
          {imageUrl ? <Image src={imageUrl} alt="" fill sizes="5rem" className="object-cover" /> : (
            <span className="font-sans text-[0.22em] font-medium tracking-normal text-foreground">{initials(name)}</span>
          )}
        </span>
      ))}
    </Link>
  );
}

export function HeroV3({ clinic, professionals }: { clinic: ClinicInfo; professionals: PublicProfessional[] }) {
  const [first, second] = t.heroV3.lines;
  const whatsappUrl = buildWhatsAppUrl(clinic.whatsapp, whatsappMessages.general());
  const route = "hidden h-8 items-center rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex";
  const chip = "inline-flex h-10 items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/60";

  return (
    <section aria-labelledby="hero-v3-title" className="container-page pt-1 pb-8 lg:pb-12">
      <div className="rounded-[2.25rem] bg-(--frame) p-2 sm:p-2.5" style={{ "--r": R, "--frame": FRAME } as CSSProperties}>
        <div className="relative h-[min(34rem,72svh)] overflow-hidden rounded-[1.75rem] bg-(--frame) md:h-[min(46rem,calc(100svh-7rem))] md:min-h-[36rem]">
          <Image
            src="/images/home/hero-v3.jpg"
            alt={t.heroV3.imageAlt}
            fill
            preload
            sizes="(min-width: 120rem) 115rem, 100vw"
            className="object-cover object-[58%_60%] mask-[linear-gradient(to_bottom,black_65%,rgb(0_0_0/0.55)_82%,rgb(0_0_0/0.15)_94%,transparent)] md:object-[60%_55%]"
          />

          {/* Top left: the label, in a cut-out of the frame. */}
          <div className="absolute top-0 left-0 rounded-br-[1.5rem] bg-(--frame) pr-2 pb-2 sm:pr-2.5 sm:pb-2.5">
            <Corner at="tl" className="top-0 left-full" />
            <Corner at="tl" className="top-full left-0" />
            <Reveal immediate delay={0.2} className="flex items-center gap-1">
              <span className="eyebrow border-transparent bg-foreground py-2 text-background">
                <LogoMark className="h-2" />
                {t.hero.eyebrow}
              </span>
              <Link href="/servicos" className={route}>
                {t.heroV3.services}
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={t.cta.whatsappAria} className={route}>
                {t.cta.whatsapp}
              </a>
            </Reveal>
          </div>

          {/* Bottom left: the booking button, on the white the photograph fades into. */}
          <div className="absolute bottom-6 left-3 hidden md:block lg:bottom-8">
            <Link
              href={bookingHref()}
              data-book-link
              className="group inline-flex h-14 items-center gap-10 rounded-[1.25rem] bg-foreground pr-2 pl-6 text-base text-background transition-colors hover:bg-foreground/85"
            >
              {t.cta.book}
              <span className="grid size-10 place-items-center rounded-full bg-background text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.6} />
              </span>
            </Link>
          </div>

          {/* Quick routes on the photograph, for phones; from md they sit in the top-left cut-out. */}
          <Reveal immediate delay={1.1} className="absolute bottom-4 left-4 flex gap-2 md:hidden">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={t.cta.whatsappAria} className={chip}>
              <WhatsAppIcon className="size-4" />
              {t.cta.whatsapp}
            </a>
            <Link href="/servicos" className={chip}>
              {t.heroV3.services}
              <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.6} />
            </Link>
          </Reveal>

          {/* Bottom right: this month, frosted over the photograph. */}
          <Reveal immediate delay={1.2} className="absolute right-5 bottom-5 hidden lg:block">
            <MonthCard />
          </Reveal>

          {/* From md: the headline in the empty sky above the figure. It is set in white and blended
              by difference, so it stays black on the sky and turns white if it ever meets the figure. */}
          <div className="absolute top-24 left-3 hidden max-w-[min(56rem,72%)] pr-8 lg:max-w-[36%] mix-blend-difference md:block lg:top-[4.5rem]">
            <Headline first={first} second={second} professionals={professionals} />
          </div>
        </div>

        {/* On phones the headline sits under the photograph, still inside the frame. */}
        <div className="px-3 pt-5 pb-3 md:hidden">
          <Headline first={first} second={second} professionals={professionals} mobile />
        </div>
      </div>
    </section>
  );
}

function Headline({
  first,
  second,
  professionals,
  mobile = false,
}: {
  first: string;
  second: string;
  professionals: PublicProfessional[];
  mobile?: boolean;
}) {
  const words = second.split(" ");
  const lead = words.slice(0, 2).join(" ");
  const rest = words.slice(2).join(" ");

  return (
    <Reveal immediate delay={0.4}>
      <h1
        id={mobile ? undefined : "hero-v3-title"}
        className={cn(
          "text-[clamp(2.6rem,1rem+3vw,4.75rem)] leading-[1.02] [text-wrap:pretty]",
          mobile ? "text-foreground" : "text-white",
        )}
      >
        <span className="block">{first}</span>
        <span className="block">
          {/* The faces travel with the first two words ("o bem-estar"), so they never sit on a line alone. */}
          <span className="whitespace-nowrap">
            <Faces professionals={professionals} inverted={!mobile} />
            {lead}
          </span>{" "}
          {rest}
        </span>
      </h1>
    </Reveal>
  );
}
