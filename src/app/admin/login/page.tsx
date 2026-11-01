import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Contours } from "@/components/shared/decor";
import { LogoMark } from "@/components/shared/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Área reservada",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-sage-300 px-4 py-12">
      <Contours />
      <div className="surface relative w-full max-w-sm p-7 sm:p-9">
        <LogoMark className="h-7" />
        <h1 className="mt-6 type-display-md">Área reservada</h1>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          Acesso exclusivo à equipa da clínica.
        </p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
