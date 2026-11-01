import Image from "next/image";
import { cn } from "@/lib/utils";
import { t } from "@/content";

const palettes = [
  { bg: "var(--color-sand-200)", figure: "var(--color-forest-700)" },
  { bg: "var(--color-sage-200)", figure: "var(--color-forest-500)" },
  { bg: "var(--color-sand-100)", figure: "var(--color-sage-500)" },
];

/**
 * Professional portrait. Shows the uploaded photo when present, otherwise a
 * neutral silhouette (never a stock "fake" face).
 */
export function Portrait({
  name,
  imageUrl,
  index = 0,
  className,
  sizes = "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw",
  priority,
}: {
  name: string;
  imageUrl?: string | null;
  index?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const p = palettes[index % palettes.length];
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden rounded-xl", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Fotografia de ${name}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <>
          <svg viewBox="0 0 300 360" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <rect width="300" height="360" fill={p.bg} />
            <path d="M58 360c4-72 44-112 92-112s88 40 92 112Z" fill={p.figure} />
            <ellipse cx="150" cy="176" rx="46" ry="52" fill={p.figure} />
          </svg>
          <span className="absolute bottom-3 left-3 rounded-full bg-card px-2.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap text-card-foreground">
            {t.team.photoPlaceholder}
          </span>
        </>
      )}
    </div>
  );
}
