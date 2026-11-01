import { t } from "@/content";

export const navItems = [
  { href: "/", label: t.nav.home },
  { href: "/sobre", label: t.nav.about },
  { href: "/servicos", label: t.nav.services },
  { href: "/equipa", label: t.nav.team },
  { href: "/espaco", label: t.nav.space },
  { href: "/contactos", label: t.nav.contact },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
