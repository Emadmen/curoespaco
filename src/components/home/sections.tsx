import Image from "next/image";
import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo, GalleryImage, PublicProfessional, PublicService, Testimonial } from "@/types";
import { TextLink } from "@/components/ui/text-link";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Contours } from "@/components/shared/decor";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { ScrubText, SplitTitle } from "@/components/shared/split-text";
import { LabelledRows, RowList } from "@/components/shared/row-list";
import { Section } from "@/components/shared/section";
import { ServiceCard } from "@/components/services/service-card";
import { ProfessionalCard } from "@/components/team/professional-card";
import { Gallery } from "@/components/space/gallery";

// ─── Statement ───────────────────────────────────────────────────────────────

export function Statement({ text }: { text: string }) {
  return (
    <section aria-label="A nossa missão" className="grid min-h-svh grid-rows-[auto_1fr] overflow-hidden bg-sand-200 lg:grid-cols-2 lg:grid-rows-1">
      <div className="container-page flex items-center py-16 lg:py-24">
        <ScrubText className="text-pretty-p max-w-xl type-display-md">{text}</ScrubText>
      </div>
      <Reveal variant="bleed" className="relative min-h-[50svh] overflow-hidden lg:min-h-0">
        <Parallax from={-5} to={5} className="absolute inset-x-0 -inset-y-[6%]">
          <Image
            src="/images/home/statement.jpg"
            alt={t.statementImageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[50%_53%]"
          />
        </Parallax>
      </Reveal>
    </section>
  );
}

// ─── Highlights ──────────────────────────────────────────────────────────────

export function Highlights() {
  return (
    <Section aria-label="Destaques">
      <LabelledRows
        label={t.highlightsLabel}
        note={
          <TextLink href="/sobre" variant="quiet" arrow>
            {t.highlightsLink}
          </TextLink>
        }
      >
        <RowList rows={t.highlights} headingAs="h2" />
      </LabelledRows>
    </Section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

export function AboutSection({ clinic }: { clinic: ClinicInfo }) {
  return (
    <Section aria-labelledby="about-title" className="overflow-hidden">
      <div className="grid-side items-center">
        <Reveal variant="image" className="relative aspect-[4/5] w-full overflow-hidden rounded-xl lg:aspect-auto lg:h-[68svh]">
          <Parallax from={-5} to={5} className="absolute inset-x-0 -inset-y-[6%]">
            <Image
              src="/images/home/about.jpg"
              alt={t.about.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[72%_50%]"
            />
          </Parallax>
        </Reveal>
        <div className="max-w-2xl">
          <SectionHeading id="about-title" stacked eyebrow={t.about.eyebrow} title={t.about.title} />
          <Reveal delay={0.2}>
            <p className="text-pretty-p mt-8 text-xl leading-relaxed text-muted-foreground">{clinic.aboutIntro}</p>
            <div className="mt-12">
              <TextLink href="/sobre" variant="cta">
                {t.nav.about}
              </TextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function PillarsSection() {
  return (
    <Section tone="paper" aria-labelledby="philosophy-title">
      <div className="grid-side items-center">
        <SectionHeading id="philosophy-title" stacked title={t.about.philosophyTitle} intro={t.about.philosophy} />
        <RowList rows={t.about.pillars} stacked />
      </div>
    </Section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────

function NotSure({ whatsapp }: { whatsapp: string }) {
  return (
    <div>
      <h3 className="type-display-sm">{t.services.notSureTitle}</h3>
      <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{t.services.notSureText}</p>
      <WhatsAppLink cta number={whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} className="mt-8" />
    </div>
  );
}

export function ServicesSection({ services, whatsapp }: { services: PublicService[]; whatsapp: string }) {
  return (
    <Section tone="paper" aria-labelledby="services-title">
      <div className="grid-side">
        <div className="space-y-14">
          <SectionHeading id="services-title" stacked eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro} />
          <NotSure whatsapp={whatsapp} />
        </div>
        <ul className="border-b">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.04}>
              <ServiceCard service={s} brief />
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/** The full list, with descriptions. The services page has its title in the page hero. */
export function ServicesPanel({ services, whatsapp }: { services: PublicService[]; whatsapp: string }) {
  return (
    <Section tone="paper" aria-label={t.nav.services}>
      <ul className="grid gap-x-20 lg:grid-cols-2">
        {services.map((s, i) => (
          <Reveal as="li" key={s.id} delay={(i % 2) * 0.06}>
            <ServiceCard service={s} />
          </Reveal>
        ))}
        <Reveal as="li" className="border-t py-6">
          <NotSure whatsapp={whatsapp} />
        </Reveal>
      </ul>
    </Section>
  );
}

// ─── How it works ────────────────────────────────────────────────────────────

export function HowItWorks({ whatsapp }: { whatsapp: string }) {
  return (
    <Section tone="forest" aria-labelledby="how-title">
      <div className="grid-side items-center">
        <div>
          <SectionHeading id="how-title" stacked eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro} />
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
            <BookLink cta />
            <WhatsAppLink cta number={whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
          </div>
        </div>
        <RowList rows={t.howItWorks.steps} numbered stacked />
      </div>
    </Section>
  );
}

// ─── Team ────────────────────────────────────────────────────────────────────

export function TeamSection({
  professionals,
  whatsapp,
  headingAs = "h2",
  showLink = true,
}: {
  professionals: PublicProfessional[];
  whatsapp: string;
  headingAs?: "h1" | "h2";
  showLink?: boolean;
}) {
  return (
    <Section aria-labelledby="team-title">
      <div className="grid-side items-center">
        <div>
          <SectionHeading id="team-title" as={headingAs} stacked eyebrow={t.team.eyebrow} title={t.team.title} intro={t.team.intro} />
          {showLink && (
            <div className="mt-12">
              <TextLink href="/equipa" variant="cta">
                {t.cta.meetTeam}
              </TextLink>
            </div>
          )}
        </div>
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {professionals.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 3) * 0.08}>
              <ProfessionalCard professional={p} whatsapp={whatsapp} index={i} />
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// ─── Space ───────────────────────────────────────────────────────────────────

export function SpaceSection({ images }: { images: GalleryImage[] }) {
  return (
    <Section tone="sand" aria-labelledby="space-title">
      <div className="grid-side items-center">
        <div>
          <SectionHeading id="space-title" stacked eyebrow={t.space.eyebrow} title={t.space.title} intro={t.space.intro} />
          <div className="mt-12">
            <TextLink href="/espaco" variant="cta">
              {t.cta.seeSpace}
            </TextLink>
          </div>
        </div>
        <Gallery images={images} />
      </div>
    </Section>
  );
}

// ─── Testimonials (only rendered with genuine, consented testimonials) ───────

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const publishable = items.filter((i) => i.consentConfirmed === true);
  if (publishable.length === 0) return null;
  return (
    <Section aria-labelledby="testimonials-title">
      <SectionHeading id="testimonials-title" eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
      <ul className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {publishable.map((item) => (
          <li key={item.id} className="border-t pt-6">
            <figure>
              <blockquote className="type-display-sm">“{item.quote}”</blockquote>
              <figcaption className="mt-6 text-sm font-medium text-muted-foreground">— {item.author}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ─── Closing CTA ─────────────────────────────────────────────────────────────

export function CtaBand({ whatsapp }: { whatsapp: string }) {
  return (
    <section aria-labelledby="cta-title" className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-sage-300">
      <Contours />
      <div className="container-page grid-split relative py-24">
        <span className="max-lg:hidden" />
        <div className="max-w-3xl">
          <SplitTitle id="cta-title" className="type-display-lg">
            {t.ctaBand.title}
          </SplitTitle>
          <Reveal delay={0.25}>
            <p className="mt-8 text-xl leading-relaxed text-muted-foreground">{t.ctaBand.text}</p>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
              <BookLink cta />
              <WhatsAppLink cta number={whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
