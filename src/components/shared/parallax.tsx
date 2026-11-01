"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Drifts its content (in % of its own height) as its section scrolls past. */
export function Parallax({
  children,
  className,
  from = 0,
  to,
  start = "top bottom",
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { yPercent: from },
          {
            yPercent: to,
            ease: "none",
            scrollTrigger: { trigger: el.closest("section") ?? el, start, end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
