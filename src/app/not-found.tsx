import { t } from "@/content";
import { TextLink } from "@/components/ui/text-link";
import { Contours } from "@/components/shared/decor";
import { LogoMark } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-sage-300 px-4 text-center">
      <Contours />
      <div className="relative">
        <LogoMark className="mx-auto h-9" />
        <p className="mt-8 eyebrow">404</p>
        <h1 className="mt-2 type-display-lg">{t.notFound.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <TextLink href="/" variant="cta">
            {t.notFound.home}
          </TextLink>
          <TextLink href="/marcar-consulta" variant="cta">
            {t.cta.book}
          </TextLink>
        </div>
      </div>
    </main>
  );
}
