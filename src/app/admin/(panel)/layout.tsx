import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/shared/logo";
import { logoutAction } from "../login/actions";

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s · Administração" },
  robots: { index: false, follow: false },
};

/** Validates the session (DB-backed) before anything in the admin panel renders. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <LogoMark className="h-7 shrink-0" />
          <span className="hidden type-display-sm sm:block">Administração</span>
          <AdminNav />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground md:block">{admin.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="rounded-full px-3 py-1.5 font-semibold text-foreground hover:bg-sage-100">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-sand-100">
      <Suspense
        fallback={
          <div className="grid min-h-dvh place-items-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-label="A carregar" />
          </div>
        }
      >
        <AdminGate>{children}</AdminGate>
      </Suspense>
      <Toaster position="top-center" />
    </div>
  );
}
