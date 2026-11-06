import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo, PublicProfessional } from "@/types";
import { BookLink } from "@/components/shared/book-link";
import { LogoMark } from "@/components/shared/logo";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonVariants } from "@/components/ui/button";

const initials = (name: string) =>
  name
    .split(" ")
    .filter((word) => /^\p{Lu}/u.test(word) && !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

/** Links to the team. Initials stand in until there are real photographs. */
function TeamAvatars({ professionals }: { professionals: PublicProfessional[] }) {
  return (
    <Link
      href="/equipa"
      aria-label={t.cta.meetTeam}
      className="group/team mt-5 flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {professionals.slice(0, 4).map(({ id, name }) => (
        <span
          key={id}
          aria-hidden="true"
          className="-mr-2 grid size-10 place-items-center rounded-full border border-forest-800 bg-sage-200 text-xs font-medium text-forest-700"
        >
          {initials(name)}
        </span>
      ))}
      <span className={buttonVariants({ size: "icon-sm", className: "relative size-10 group-hover/team:bg-primary/85" })}>
        <Plus aria-hidden="true" />
      </span>
    </Link>
  );
}

export function Hero({ clinic, professionals }: { clinic: ClinicInfo; professionals: PublicProfessional[] }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="tone-forest relative -mt-[4.5rem] overflow-hidden bg-forest-900 text-foreground sm:bg-sand-50 lg:-mt-20"
    >
      {/* On phones the photo stops short of the foot, which keeps the title on the plain background.
          From sm up it runs past the first screen and dissolves into the paper. */}
      <Parallax to={4} start="top top" className="absolute inset-x-0 -top-[5%] bottom-[34%] max-sm:mask-[linear-gradient(to_bottom,black_65%,transparent)] sm:-bottom-[5%] sm:hero-photo-fade">
        <Image
          src="/images/home/hero.jpg"
          alt={t.hero.imageAlt}
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
      </Parallax>

      {/* The whole first screen is photograph; the fade starts below the fold. */}
      <div className="relative flex min-h-svh flex-col justify-end">
        <div aria-hidden="true" className="hero-scrim absolute inset-0" />

        <div className="container-page relative pt-32 pb-28 lg:pb-10">
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
            <div>
              <Reveal immediate delay={0.2}>
                <span className="eyebrow glass">
                  <LogoMark className="h-2" />
                  {t.hero.eyebrow}
                </span>
              </Reveal>
              <SplitTitle as="h1" id="hero-title" immediate delay={0.3} className="mt-6 max-w-[12em] type-display-xl font-light text-primary [text-wrap:pretty]">
                {clinic.heroTitle}
              </SplitTitle>
              <Reveal immediate delay={0.9} className="mt-8 flex flex-wrap items-center gap-3">
                <BookLink size="lg" className="max-sm:w-full" />
                <WhatsAppLink
                  size="lg"
                  number={clinic.whatsapp}
                  message={whatsappMessages.general()}
                  label={t.cta.whatsappLong}
                  className="max-sm:w-full"
                />
              </Reveal>
            </div>

            <Reveal immediate delay={1.1}>
              <div className="glass rounded-2xl p-6">
                <p className="type-display-md font-light text-primary">{t.hero.statValue}</p>
                <p className="mt-2 text-sm leading-snug text-muted-foreground">{t.hero.statLabel}</p>
                <TeamAvatars professionals={professionals} />
              </div>
            </Reveal>
          </div>

          <Reveal
            immediate
            delay={1.3}
            className="mt-10 hidden grid-cols-3 gap-6 border-t pt-5 text-sm text-muted-foreground sm:grid"
          >
            <address className="not-italic">
              {clinic.addressLine1}, {clinic.postalCode} {clinic.city}
            </address>
            <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className="justify-self-center hover:text-foreground">
              {clinic.phone}
            </a>
            <a href={`mailto:${clinic.email}`} className="justify-self-end hover:text-foreground">
              {clinic.email}
            </a>
          </Reveal>
        </div>
      </div>

      {/* Room for the photograph to fade slowly into the page. */}
      <div aria-hidden="true" className="relative hidden h-64 sm:block lg:h-80" />
    </section>
  );
}
