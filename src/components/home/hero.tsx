import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo } from "@/types";
import { BookLink } from "@/components/shared/book-link";
import { Contours } from "@/components/shared/decor";
import { LogoMark } from "@/components/shared/logo";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";

export function Hero({ clinic }: { clinic: ClinicInfo }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mt-[4.5rem] flex min-h-svh flex-col justify-center overflow-hidden lg:justify-start bg-sage-300 pt-[4.5rem] lg:-mt-20 lg:pt-20"
    >
      <Contours />
      <Parallax to={-14} start="top top" className="container-page grid-hero hero-offset relative py-16">
        <Reveal immediate delay={0.2}>
          <LogoMark className="h-8 sm:h-10 lg:mt-2 lg:h-[3.3vw]" />
        </Reveal>
        <div className="max-w-5xl">
          <SplitTitle as="h1" id="hero-title" immediate delay={0.3} className="max-w-[7.6em] type-display-xl [text-wrap:pretty]">
            {clinic.heroTitle}
          </SplitTitle>
          <Reveal immediate delay={0.9} className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            <BookLink cta />
            <WhatsAppLink
              cta
              number={clinic.whatsapp}
              message={whatsappMessages.general()}
              label={t.cta.whatsappLong}
            />
          </Reveal>
          <Reveal immediate delay={1.1}>
            <p className="mt-6 text-muted-foreground">{t.hero.trustNote}</p>
          </Reveal>
        </div>
      </Parallax>
    </section>
  );
}
