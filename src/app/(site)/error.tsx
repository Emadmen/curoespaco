"use client";

import Link from "next/link";
import { t } from "@/content";
import { Button, buttonVariants } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <h1 className="type-display-md">{t.error.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">{t.error.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            {t.error.retry}
          </Button>
          <Link href="/" className={buttonVariants({ size: "lg", variant: "outline" })}>
            {t.notFound.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
