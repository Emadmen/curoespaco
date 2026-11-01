"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { t } from "@/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Privacy-friendly map: the third-party Google Maps iframe (which may set
 * cookies) only loads after the visitor explicitly asks for it.
 */
export function MapEmbed({ embedUrl, mapsUrl, address }: { embedUrl?: string | null; mapsUrl?: string | null; address: string }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded && embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={t.contact.mapTitle}
        className="size-full min-h-80 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative flex size-full min-h-80 flex-col items-center justify-center overflow-hidden bg-sage-100 p-8 text-center">
      {/* stylised map background */}
      <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full opacity-70">
        <rect width="400" height="300" fill="var(--color-sage-100)" />
        <path d="M-10 210C80 180 120 240 220 200s140-90 200-70" stroke="var(--color-sage-200)" strokeWidth="26" fill="none" />
        <path d="M60-10l40 320M260-10l-30 320M-10 90h420" stroke="#fff" strokeWidth="10" fill="none" />
        <path d="M-10 150c100 20 200-30 420 10" stroke="#fff" strokeWidth="6" fill="none" />
        <circle cx="300" cy="70" r="30" fill="var(--color-sage-100)" />
        <rect x="120" y="40" width="60" height="34" rx="8" fill="var(--color-sage-200)" />
        <rect x="290" y="210" width="70" height="40" rx="8" fill="var(--color-sage-200)" />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <MapPin className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 max-w-xs rounded-xl bg-card px-4 py-2 font-medium text-foreground">{address}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {embedUrl && (
            <button type="button" onClick={() => setLoaded(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t.contact.loadMap}
            </button>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "sm" }))}>
              {t.cta.openMaps}
            </a>
          )}
        </div>
        {embedUrl && <p className="mt-3 max-w-xs text-xs text-muted-foreground">{t.contact.mapConsent}</p>}
      </div>
    </div>
  );
}
