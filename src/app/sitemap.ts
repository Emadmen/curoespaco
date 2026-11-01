import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/clinic";
import { getProfessionals, getServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, professionals] = await Promise.all([getServices(), getProfessionals()]);
  const url = (path: string) => `${siteConfig.url}${path}`;
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/marcar-consulta", priority: 0.9 },
    { path: "/servicos", priority: 0.8 },
    { path: "/equipa", priority: 0.8 },
    { path: "/sobre", priority: 0.7 },
    { path: "/espaco", priority: 0.6 },
    { path: "/contactos", priority: 0.7 },
    { path: "/politica-de-privacidade", priority: 0.2 },
    { path: "/termos-e-condicoes", priority: 0.2 },
  ];
  return [
    ...pages.map((p) => ({ url: url(p.path), priority: p.priority, changeFrequency: "monthly" as const })),
    ...services.map((s) => ({ url: url(`/servicos/${s.slug}`), priority: 0.7, changeFrequency: "monthly" as const })),
    ...professionals.map((p) => ({ url: url(`/equipa/${p.slug}`), priority: 0.6, changeFrequency: "monthly" as const })),
  ];
}
