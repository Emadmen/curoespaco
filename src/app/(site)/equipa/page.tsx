import type { Metadata } from "next";
import { t } from "@/content";
import { getClinic, getProfessionals } from "@/lib/data";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { ProfessionalCard } from "@/components/team/professional-card";
import { CtaBand } from "@/components/home/sections";

export const metadata: Metadata = {
  title: t.nav.team,
  description: t.team.intro,
  alternates: { canonical: "/equipa" },
};

export default async function TeamPage() {
  const [clinic, professionals] = await Promise.all([getClinic(), getProfessionals()]);
  return (
    <>
      <PageHero eyebrow={t.team.eyebrow} title={t.team.title} intro={t.team.intro} />
      <Section aria-label={t.nav.team}>
        <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 3) * 0.08}>
              <ProfessionalCard professional={p} whatsapp={clinic.whatsapp} index={i} />
            </Reveal>
          ))}
        </ul>
      </Section>
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
