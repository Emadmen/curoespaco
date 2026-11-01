import Link from "next/link";
import { cn } from "@/lib/utils";

/** Three soft shapes side by side, drawn in the current text colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" aria-hidden="true" fill="currentColor" className={cn("h-6 w-auto", className)}>
      <rect x="1.5" y="3.5" width="17" height="17" rx="4.5" transform="rotate(45 10 12)" />
      <rect x="22" y="0" width="16" height="24" rx="5" />
      <rect x="41.5" y="3.5" width="17" height="17" rx="4.5" transform="rotate(45 50 12)" />
    </svg>
  );
}

export function Logo({ name, className }: { name: string; className?: string }) {
  // Show only the first word ("Cora Psicologia" → "Cora").
  const [first] = name.split(" ");
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
        className,
      )}
      aria-label={`${name} — início`}
    >
      <LogoMark className="h-[1.125rem]" />
      <span className="text-[1.0625rem] leading-none font-medium tracking-tight">{first}</span>
    </Link>
  );
}
