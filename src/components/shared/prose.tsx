import type { ReactNode } from "react";

/** Readable long-form text (legal pages). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl lg:ml-[calc(25%+0.5rem)] text-[1.0625rem] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:type-display-sm [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
