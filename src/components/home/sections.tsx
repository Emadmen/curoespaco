import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { PublicProfessional, PublicService, Testimonial } from "@/types";
import { TextLink } from "@/components/ui/text-link";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Parallax } from "@/components/shared/parallax";
import { Reveal } from "@/components/shared/reveal";
import { LogoMark } from "@/components/shared/logo";
import { SplitTitle } from "@/components/shared/split-text";
import { LabelledRows, RowList } from "@/components/shared/row-list";
import { Section } from "@/components/shared/section";
import { TestimonialsCarousel } from "@/components/home/testimonials";
import { ServiceCard } from "@/components/services/service-card";
import { ProfessionalCard } from "@/components/team/professional-card";

// ─── Highlights ──────────────────────────────────────────────────────────────

export function Highlights() {
  return (
    <Section aria-label="Destaques" space="md" fill={false}>
      <LabelledRows
        label={t.highlightsLabel}
        note={
          <TextLink href="/sobre" variant="quiet" arrow>
            {t.highlightsLink}
          </TextLink>
        }
      >
        <RowList rows={t.highlights} headingAs="h2" compact />
      </LabelledRows>
    </Section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

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

// ─── Testimonials (only rendered with genuine, consented testimonials) ───────

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const publishable = items.filter((i) => i.consentConfirmed === true);
  if (publishable.length > 0) return <TestimonialsCarousel items={publishable} />;
  // Marked samples, so the layout can be reviewed. They never reach production.
  if (process.env.NODE_ENV === "development") return <TestimonialsCarousel items={t.testimonials.samples} sample />;
  return null;
}

// ─── Closing CTA ─────────────────────────────────────────────────────────────

export function CtaBand({ whatsapp }: { whatsapp: string }) {
  return (
    <section aria-labelledby="cta-title" className="flex min-h-svh flex-col">
      <aside className="bg-primary px-4 py-3 text-center text-sm text-primary-foreground">
        <p className="text-pretty-p mx-auto max-w-3xl">
          {t.crisis.lead}{" "}
          <a href={`tel:${t.crisis.line}`} className="font-semibold underline underline-offset-3">
            {t.crisis.line}
          </a>
          {t.crisis.lineNote}{" "}
          <a href={`tel:${t.crisis.emergency}`} className="font-semibold underline underline-offset-3">
            {t.crisis.emergency}
          </a>
          .
        </p>
      </aside>
      <div className="tone-forest relative flex flex-1 flex-col justify-center overflow-hidden bg-forest-900 text-foreground">
        <Parallax from={-6} to={6} className="absolute inset-x-0 -inset-y-[10%]">
          <div className="glow size-full" />
        </Parallax>
        <div className="container-page relative py-24 text-center">
          <Reveal className="flex justify-center">
            <p className="eyebrow glass">
              <LogoMark className="h-2" />
              {t.ctaBand.eyebrow}
            </p>
          </Reveal>
          <SplitTitle id="cta-title" className="mx-auto mt-5 max-w-[16em] text-balance type-display-lg">
            {t.ctaBand.title}
          </SplitTitle>
          <Reveal delay={0.25}>
            <p className="text-pretty-p mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">{t.ctaBand.text}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <BookLink size="xl" />
              <WhatsAppLink variant="ghost" size="xl" number={whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
