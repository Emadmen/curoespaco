import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo } from "@/types";
import { BookLink } from "@/components/shared/book-link";
import { HeroVideo } from "@/components/home/hero-video";
import { LogoMark } from "@/components/shared/logo";
import { MonthCard } from "@/components/home/month-card";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";

export function Hero({ clinic }: { clinic: ClinicInfo }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="tone-forest relative -mt-[4.5rem] overflow-hidden bg-sand-50 text-foreground max-sm:template-3:bg-white lg:-mt-20"
    >
      {/* On phones the video fills the whole first screen and its foot dissolves into the paper; the
          calendar waits below. From sm up it runs past the first screen and dissolves into the paper.
          The fade sits on this still wrapper; only the photo inside drifts, so the fade never slides with it. */}
      <div className="absolute inset-x-0 top-0 h-svh overflow-hidden max-sm:mask-[linear-gradient(to_bottom,black_80%,transparent)] sm:bottom-0 sm:h-auto sm:hero-photo-fade">
        <Parallax to={4} start="top top" className="absolute inset-x-0 -top-[5%] -bottom-[5%]">
          <HeroVideo
            src="/videos/hero.mp4"
            mobileSrc="/videos/hero-720.mp4"
            poster="/videos/hero-poster.jpg"
            className="absolute inset-0 size-full object-cover object-center"
          />
        </Parallax>
        {/* Phones: the lower video darkens behind the white title; the wrapper's fade then takes both into the paper. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-forest-900/80 from-10% via-forest-900/55 via-40% to-transparent to-80% sm:hidden"
        />
      </div>

      {/* The whole first screen is photograph; the fade starts below the fold. */}
      <div className="relative flex min-h-svh flex-col justify-end">
        <div aria-hidden="true" className="hero-scrim absolute inset-0 max-sm:hidden" />

        <div className="container-page relative pt-32 pb-[max(7rem,26svh)] sm:pb-28 lg:pb-10">
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
            <div>
              <Reveal immediate delay={0.2}>
                <span className="eyebrow glass">
                  <LogoMark className="h-2" />
                  {t.hero.eyebrow}
                </span>
              </Reveal>
              <SplitTitle as="h1" id="hero-title" immediate delay={0.3} className="mt-6 max-w-[12em] type-display-xl leading-[1.18] font-light text-forest-900 [text-wrap:pretty] max-sm:text-white max-sm:**:bg-transparent max-sm:**:px-0" mark>
                {clinic.heroTitle}
              </SplitTitle>
              <Reveal immediate delay={0.9} className="mt-8 flex items-center gap-3 max-[359px]:flex-col max-[359px]:items-stretch">
                <BookLink size="lg" className="max-sm:min-w-0 max-sm:flex-1 max-sm:px-4" />
                <WhatsAppLink
                  size="lg"
                  number={clinic.whatsapp}
                  message={whatsappMessages.general()}
                  label={t.cta.whatsappLong}
                  shortLabel={t.cta.whatsapp}
                  className="max-sm:min-w-0 max-sm:flex-1 max-sm:px-4"
                />
              </Reveal>
            </div>

            {/* On phones the calendar waits below the first screen (see the end of the section). */}
            <Reveal immediate delay={1.1} className="max-sm:hidden">
              <MonthCard />
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
      <div aria-hidden="true" className="relative hidden h-72 sm:block lg:h-96" />
      {/* On phones the calendar follows the first screen, as a tinted glass card on the paper. */}
      <Reveal className="container-page relative pt-2 pb-6 sm:hidden">
        <MonthCard tone="frost" className="w-full" />
      </Reveal>
    </section>
  );
}
