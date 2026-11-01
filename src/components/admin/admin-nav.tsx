"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, Settings, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Pedidos", icon: CalendarDays, exact: true },
  { href: "/admin/servicos", label: "Serviços", icon: Stethoscope },
  { href: "/admin/profissionais", label: "Profissionais", icon: Users },
  { href: "/admin/definicoes", label: "Definições", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administração" className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-sage-100",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sr-only sm:hidden">{label}</span>
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-sage-100"
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        <span className="hidden lg:inline">Ver site</span>
        <span className="sr-only lg:hidden">Ver site</span>
      </Link>
    </nav>
  );
}
