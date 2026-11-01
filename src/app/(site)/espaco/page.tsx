import type { Metadata } from "next";
import { galleryImages } from "@/config/clinic";
import { t } from "@/content";
import { getClinic } from "@/lib/data";
import { PageHero } from "@/components/shared/page-hero";
import { RowList } from "@/components/shared/row-list";
import { Section } from "@/components/shared/section";
import { Gallery } from "@/components/space/gallery";
import { BookLink } from "@/components/shared/book-link";
import { CtaBand } from "@/components/home/sections";

export const metadata: Metadata = {
  title: t.nav.space,
  description: t.space.intro,
  alternates: { canonical: "/espaco" },
};

export default async function SpacePage() {
  const clinic = await getClinic();
  const rooms = galleryImages.slice(0, 4).map((img) => ({ title: img.title, text: img.description }));
  return (
    <>
      <PageHero eyebrow={t.space.eyebrow} title={t.space.title} intro={t.space.intro}>
        <BookLink cta />
      </PageHero>
      <Section aria-label={t.nav.space}>
        <Gallery images={galleryImages} layout="grid" />
      </Section>
      <Section tone="paper" aria-label={t.space.eyebrow}>
        <RowList rows={rooms} headingAs="h2" />
      </Section>
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
