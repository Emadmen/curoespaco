"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { format, t } from "@/content";
import type { GalleryImage } from "@/types";
import { PlaceholderArt } from "@/components/shared/placeholder-art";
import { Reveal } from "@/components/shared/reveal";

function Media({ image, sizes }: { image: GalleryImage; sizes: string }) {
  return image.src ? (
    <Image src={image.src} alt={image.title} fill sizes={sizes} className="object-cover" />
  ) : (
    <PlaceholderArt variant={image.variant} title={`${image.title} — ${t.space.placeholderNote}`} />
  );
}

/** Responsive gallery with an accessible, keyboard-navigable lightbox. */
export function Gallery({ images, layout = "mosaic" }: { images: GalleryImage[]; layout?: "mosaic" | "grid" }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = open ? images[index] : null;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  return (
    <>
      <ul
        className={cn(
          "grid gap-4 sm:gap-6",
          layout === "mosaic"
            ? "grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 [&>li:first-child]:col-span-2 [&>li:first-child]:row-span-2"
            : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {images.map((image, i) => (
          <Reveal as="li" variant="image" delay={(i % 3) * 0.1} key={image.id} className={cn(layout === "mosaic" && i > 2 && "hidden")}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={format(t.space.openImage, { title: image.title })}
              className={cn(
                "group relative block w-full overflow-hidden rounded-xl bg-sage-100 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                layout === "mosaic" && i === 0 ? "aspect-square lg:aspect-auto lg:h-full" : "aspect-[3/2]",
              )}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]">
                <Media image={image} sizes="(min-width: 1024px) 40vw, 50vw" />
              </div>
              <span className="absolute bottom-3 left-3 rounded-full bg-card px-3 py-1 text-[0.8125rem] font-medium text-card-foreground">{image.title}</span>
            </button>
          </Reveal>
        ))}
      </ul>

      <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-forest-900/90 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-8">
            {current && (
              <>
                <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-xl bg-sage-100">
                  <Media image={current} sizes="90vw" />
                </div>
                <div className="mt-4 flex w-full max-w-5xl items-center justify-between gap-4 text-primary-foreground">
                  <div>
                    <DialogPrimitive.Title className="type-display-sm">{current.title}</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-sm text-sage-200">
                      {current.description}
                      {!current.src && <span className="block text-xs text-sage-300">{t.space.placeholderNote}</span>}
                    </DialogPrimitive.Description>
                  </div>
                  <p className="shrink-0 text-sm text-sage-200 tabular-nums" aria-live="polite">
                    {index! + 1} / {images.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.space.lightboxPrev}
                  className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-card text-foreground hover:bg-sand-100 sm:left-6"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.space.lightboxNext}
                  className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-card text-foreground hover:bg-sand-100 sm:right-6"
                >
                  <ChevronRight className="size-6" />
                </button>
                <DialogPrimitive.Close
                  aria-label={t.space.lightboxClose}
                  className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-card text-foreground hover:bg-sand-100"
                >
                  <X className="size-6" />
                </DialogPrimitive.Close>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
