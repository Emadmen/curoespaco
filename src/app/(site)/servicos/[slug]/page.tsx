import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, t } from "@/content";
import { getClinic, getProfessionals, getServiceBySlug, getServices } from "@/lib/data";
import { whatsappMessages } from "@/lib/whatsapp";
import { PageHero } from "@/components/shared/page-hero";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Section } from "@/components/shared/section";
import { TextLink } from "@/components/ui/text-link";
import { ServiceIcon } from "@/components/services/service-icon";
import { ProfessionalCard } from "@/components/team/professional-card";
import { CtaBand } from "@/components/home/sections";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/servicos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.shortDescription,
    alternates: { canonical: `/servicos/${service.slug}` },
  };
}

export default async function ServicePage(props: PageProps<"/servicos/[slug]">) {
  const { slug } = await props.params;
  const [service, clinic, professionals, services] = await Promise.all([
    getServiceBySlug(slug),
    getClinic(),
    getProfessionals(),
    getServices(),
  ]);
  if (!service) notFound();

  const team = professionals.filter((p) => p.serviceIds.includes(service.id));
  const others = services.filter((s) => s.id !== service.id).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={t.services.eyebrow}
        title={service.name}
        intro={service.shortDescription}
        aside={<ServiceIcon name={service.icon} className="size-12 max-lg:hidden" />}
      >
        <div className="flex flex-wrap items-center gap-3">
          <BookLink size="xl" service={service.slug} />
          <WhatsAppLink
            variant="secondary"
            size="xl"
            number={clinic.whatsapp}
            message={whatsappMessages.service(service.name)}
            label={t.cta.whatsappLong}
          />
        </div>
      </PageHero>

      <Section aria-label={service.name}>
        <div className="grid-split">
          <aside>
            <p className="eyebrow">{format(t.services.duration, { minutes: service.durationMinutes })}</p>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t.howItWorks.intro}</p>
          </aside>
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            {service.description.split(/\n{2,}/).map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>
        </div>
      </Section>

      {team.length > 0 && (
        <Section tone="paper" aria-labelledby="service-team">
          <div className="grid-side items-center">
            <h2 id="service-team" className="type-display-md">
              {t.services.professionalsTitle}
            </h2>
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {team.map((p, i) => (
                <li key={p.id}>
                  <ProfessionalCard professional={p} whatsapp={clinic.whatsapp} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {others.length > 0 && (
        <Section space="md" aria-labelledby="other-services">
          <div className="grid-split">
            <h2 id="other-services" className="eyebrow">
              {t.services.othersTitle}
            </h2>
            <ul className="border-b">
              {others.map((s) => (
                <li key={s.id} className="border-t">
                  <TextLink href={`/servicos/${s.slug}`} variant="quiet" arrow className="flex justify-between py-4 type-display-sm">
                    {s.name}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
