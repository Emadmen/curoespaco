import type { GalleryVariant } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Illustrated stand-ins for clinic photographs. Replace with real photos by
 * setting `src` on the gallery items in src/config/clinic.ts.
 */
export function PlaceholderArt({
  variant,
  className,
  title,
}: {
  variant: GalleryVariant;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block size-full", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="400" height="300" fill="var(--color-sand-100)" />
      <rect y="228" width="400" height="72" fill="var(--color-sand-200)" />
      <path d="M0 228h400" stroke="var(--color-sand-300)" strokeWidth="2" />
      {variant === "room" && <Room />}
      {variant === "group" && <Group />}
      {variant === "reception" && <Reception />}
      {variant === "waiting" && <Waiting />}
      {variant === "kids" && <Kids />}
    </svg>
  );
}

function Plant({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <g transform={`translate(${x} 228) scale(${scale})`}>
      <path d="M-14 0h28l-4-26h-20Z" fill="var(--color-sage-400)" />
      <path d="M0-26c-2-30 4-54 14-70-2 24 0 48-8 70Z" fill="var(--color-forest-500)" />
      <path d="M-2-26c-14-20-28-30-44-32 8 14 22 26 40 36Z" fill="var(--color-sage-500)" />
      <path d="M2-30c10-22 26-34 42-38-8 16-22 30-38 42Z" fill="var(--color-forest-700)" />
    </g>
  );
}

function ArchWindow({ x, w = 110, h = 140 }: { x: number; w?: number; h?: number }) {
  const r = w / 2;
  const top = 200 - h;
  return (
    <g>
      <path d={`M${x} 200V${top + r}a${r} ${r} 0 0 1 ${w} 0V200Z`} fill="var(--color-sage-300)" />
      <circle cx={x + w * 0.65} cy={top + r + 8} r={w * 0.16} fill="#fff" opacity=".7" />
      <path
        d={`M${x} 200V${top + r}a${r} ${r} 0 0 1 ${w} 0V200Z M${x + r} ${top}V200`}
        fill="none"
        stroke="#fff"
        strokeWidth="6"
      />
      <rect x={x - 8} y="198" width={w + 16} height="7" rx="3" fill="var(--color-sand-300)" />
    </g>
  );
}

function Room() {
  return (
    <g>
      <ArchWindow x={60} />
      <ellipse cx="230" cy="262" rx="130" ry="18" fill="var(--color-sage-200)" />
      {/* armchair */}
      <rect x="180" y="150" width="96" height="70" rx="30" fill="var(--color-sage-400)" />
      <rect x="168" y="186" width="120" height="44" rx="18" fill="var(--color-sage-500)" />
      <rect x="160" y="178" width="26" height="54" rx="13" fill="var(--color-sage-400)" />
      <rect x="270" y="178" width="26" height="54" rx="13" fill="var(--color-sage-400)" />
      <path d="M180 232l-4 14M276 232l4 14" stroke="var(--color-forest-700)" strokeWidth="5" strokeLinecap="round" />
      {/* side table + lamp */}
      <rect x="312" y="190" width="44" height="6" rx="3" fill="var(--color-forest-700)" />
      <path d="M334 196v44M320 240h28" stroke="var(--color-forest-700)" strokeWidth="4" strokeLinecap="round" />
      <path d="M334 190v-36" stroke="var(--color-forest-500)" strokeWidth="3" />
      <path d="M318 154h32l-8-26h-16Z" fill="#fff" stroke="var(--color-sage-200)" strokeWidth="2" />
      <Plant x={370} scale={0.9} />
    </g>
  );
}

function Group() {
  const chair = (x: number, color: string) => (
    <g key={x}>
      <rect x={x} y="168" width="58" height="56" rx="22" fill={color} />
      <rect x={x - 6} y="196" width="70" height="30" rx="14" fill={color} opacity=".85" />
      <path d={`M${x + 4} 226l-3 12M${x + 54} 226l3 12`} stroke="var(--color-forest-700)" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <ArchWindow x={36} w={84} h={120} />
      <ArchWindow x={280} w={84} h={120} />
      <ellipse cx="200" cy="262" rx="150" ry="20" fill="var(--color-sage-100)" />
      {chair(92, "var(--color-sage-300)")}
      {chair(171, "var(--color-sage-400)")}
      {chair(250, "var(--color-sage-300)")}
      <circle cx="200" cy="120" r="16" fill="#fff" stroke="var(--color-sage-200)" strokeWidth="2" />
      <path d="M200 60v44" stroke="var(--color-forest-500)" strokeWidth="2" />
    </g>
  );
}

function Reception() {
  return (
    <g>
      {/* wall art */}
      <circle cx="110" cy="96" r="38" fill="var(--color-sage-400)" opacity=".8" />
      <circle cx="140" cy="110" r="30" fill="var(--color-sage-300)" style={{ mixBlendMode: "multiply" }} />
      {/* pendant lights */}
      {[230, 290].map((x) => (
        <g key={x}>
          <path d={`M${x} 0v70`} stroke="var(--color-forest-500)" strokeWidth="2" />
          <path d={`M${x - 18} 90a18 18 0 0 1 36 0Z`} fill="var(--color-forest-700)" />
          <circle cx={x} cy="96" r="5" fill="var(--color-sage-100)" />
        </g>
      ))}
      {/* desk */}
      <rect x="170" y="150" width="190" height="78" rx="18" fill="#fff" />
      <rect x="164" y="142" width="202" height="14" rx="7" fill="var(--color-forest-700)" />
      <path d="M192 180h146" stroke="var(--color-sage-200)" strokeWidth="10" strokeLinecap="round" />
      <path d="M192 204h146" stroke="var(--color-sage-200)" strokeWidth="10" strokeLinecap="round" />
      <Plant x={66} />
    </g>
  );
}

function Waiting() {
  return (
    <g>
      <rect x="250" y="56" width="90" height="70" rx="10" fill="#fff" stroke="var(--color-sand-300)" strokeWidth="4" />
      <path d="M262 112c14-20 24-26 34-14s18 6 32-12" stroke="var(--color-sage-400)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ArchWindow x={56} w={86} h={124} />
      {/* sofa */}
      <rect x="160" y="160" width="200" height="56" rx="24" fill="var(--color-sage-400)" />
      <rect x="148" y="190" width="224" height="40" rx="18" fill="var(--color-sage-300)" />
      <rect x="176" y="168" width="40" height="34" rx="12" fill="var(--color-sage-400)" />
      <rect x="300" y="168" width="40" height="34" rx="12" fill="var(--color-sage-100)" />
      <path d="M164 230l-3 12M356 230l3 12" stroke="var(--color-forest-700)" strokeWidth="5" strokeLinecap="round" />
      {/* coffee table */}
      <ellipse cx="250" cy="256" rx="60" ry="10" fill="var(--color-forest-700)" />
      <rect x="226" y="236" width="36" height="12" rx="3" fill="#fff" />
      <Plant x={50} scale={0.8} />
    </g>
  );
}

function Kids() {
  return (
    <g>
      {/* rainbow */}
      <g fill="none" strokeLinecap="round" strokeWidth="16">
        <path d="M70 150a70 70 0 0 1 140 0" stroke="var(--color-sage-400)" />
        <path d="M92 150a48 48 0 0 1 96 0" stroke="var(--color-sage-300)" />
        <path d="M114 150a26 26 0 0 1 52 0" stroke="var(--color-sand-200)" />
      </g>
      {/* low table */}
      <ellipse cx="270" cy="200" rx="70" ry="14" fill="#fff" />
      <path d="M220 206v30M320 206v30" stroke="var(--color-forest-700)" strokeWidth="6" strokeLinecap="round" />
      {/* blocks */}
      <rect x="240" y="168" width="24" height="24" rx="4" fill="var(--color-sage-400)" />
      <rect x="268" y="172" width="20" height="20" rx="4" fill="var(--color-sage-400)" />
      <path d="M252 168l12-20 12 20Z" fill="var(--color-forest-700)" />
      {/* beanbag */}
      <path d="M50 236c0-34 30-56 62-56s60 22 60 56Z" fill="var(--color-sage-300)" />
      <circle cx="350" cy="240" r="14" fill="var(--color-sage-400)" />
      <circle cx="372" cy="246" r="8" fill="var(--color-sage-400)" />
    </g>
  );
}
