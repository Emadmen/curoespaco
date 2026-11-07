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
      className="tone-forest relative -mt-[4.5rem] overflow-hidden bg-forest-900 text-foreground sm:bg-sand-50 lg:-mt-20"
    >
      {/* On phones the photo stops short of the foot, which keeps the title on the plain background.
          From sm up it runs past the first screen and dissolves into the paper. The fade sits on
          this still wrapper; only the photo inside drifts, so the fade never slides with it. */}
      <div className="absolute inset-x-0 top-0 bottom-[34%] overflow-hidden max-sm:mask-[linear-gradient(to_bottom,black_65%,transparent)] sm:bottom-0 sm:hero-photo-fade">
        <Parallax to={4} start="top top" className="absolute inset-x-0 -top-[5%] -bottom-[5%]">
          <HeroVideo
            src="/videos/hero.mp4"
            mobileSrc="/videos/hero-720.mp4"
            poster="/videos/hero-poster.jpg"
            className="absolute inset-0 size-full object-cover object-center"
          />
        </Parallax>
      </div>

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
              <SplitTitle as="h1" id="hero-title" immediate delay={0.3} className="mt-6 max-w-[12em] type-display-xl leading-[1.18] font-light text-forest-900 [text-wrap:pretty]" mark>
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

            {/* The calendar is too tall for a phone's first screen; the booking bar covers it there. */}
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
    </section>
  );
}
