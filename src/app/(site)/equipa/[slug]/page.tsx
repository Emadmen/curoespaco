import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { t } from "@/content";
import { getClinic, getProfessionalBySlug, getProfessionals, getServices } from "@/lib/data";
import { whatsappMessages } from "@/lib/whatsapp";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Contours } from "@/components/shared/decor";
import { Section } from "@/components/shared/section";
import { Badge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/text-link";
import { Portrait } from "@/components/team/portrait";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";
import { CtaBand } from "@/components/home/sections";

export async function generateStaticParams() {
  return (await getProfessionals()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/equipa/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const professional = await getProfessionalBySlug(slug);
  if (!professional) return {};
  return {
    title: professional.name,
    description: `${professional.title}. ${professional.bio}`.slice(0, 160),
    alternates: { canonical: `/equipa/${professional.slug}` },
  };
}

export default async function ProfessionalPage(props: PageProps<"/equipa/[slug]">) {
  const { slug } = await props.params;
  const [professional, professionals, clinic, services] = await Promise.all([
    getProfessionalBySlug(slug),
    getProfessionals(),
    getClinic(),
    getServices(),
  ]);
  if (!professional) notFound();
  const index = professionals.findIndex((p) => p.id === professional.id);
  const offered = services.filter((s) => professional.serviceIds.includes(s.id));

  return (
    <>
      <section className="relative -mt-[4.5rem] flex min-h-svh flex-col justify-center overflow-hidden bg-sage-300 pt-[4.5rem] lg:-mt-20 lg:pt-20">
        <Contours />
        <div className="container-page grid-split relative items-center py-16">
          <Reveal immediate variant="image" className="max-w-xs lg:max-w-none">
            <Portrait name={professional.name} imageUrl={professional.imageUrl} index={index} priority />
          </Reveal>
          <div>
            <TextLink href="/equipa" variant="quiet" size="sm">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t.team.backToTeam}
            </TextLink>
            <SplitTitle as="h1" immediate delay={0.2} className="mt-6 type-display-lg">
              {professional.name}
            </SplitTitle>
            <p className="mt-3 text-xl text-muted-foreground">{professional.title}</p>
            {professional.registrationNumber && (
              <p className="mt-2 text-muted-foreground">
                {t.team.registration}: {professional.registrationNumber}
              </p>
            )}
            <div className="mt-12 flex flex-wrap items-center gap-3">
              <BookLink size="xl" professional={professional.slug} label={t.cta.bookWithProfessional} />
              <WhatsAppLink
                variant="secondary"
                size="xl"
                number={clinic.whatsapp}
                message={whatsappMessages.therapist(professional.name)}
                label={t.cta.whatsappLong}
              />
            </div>
          </div>
        </div>
      </section>

      <Section aria-label={t.team.bioTitle}>
        <div className="grid-split">
          <h2 className="eyebrow">{t.team.bioTitle}</h2>
          <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-muted-foreground">
            {professional.bio.split(/\n{2,}/).map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>

          {professional.expertise.length > 0 && (
            <>
              <h2 className="eyebrow mt-12">{t.team.expertise}</h2>
              <ul className="flex flex-wrap gap-2 lg:mt-12">
                {professional.expertise.map((e) => (
                  <li key={e}>
                    <Badge tone="outline" className="px-3.5 py-1 text-sm">{e}</Badge>
                  </li>
                ))}
              </ul>
            </>
          )}

          {offered.length > 0 && (
            <>
              <h2 className="eyebrow mt-12">{t.team.servicesTitle}</h2>
              <ul className="border-b lg:mt-12">
                {offered.map((s) => (
                  <li key={s.id} className="border-t">
                    <TextLink
                      href={`/marcar-consulta?servico=${s.slug}&profissional=${professional.slug}`}
                      variant="quiet"
                      arrow
                      className="flex justify-between py-4 type-display-sm"
                    >
                      {s.name}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Section>
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
