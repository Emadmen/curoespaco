"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * The logo's shapes, enlarged into outlines: the tall rounded rectangle (tilted
 * and left open at the foot) and the diamond, which runs off the top of the band.
 */
const shapes = [
  {
    transform: "rotate(9 490 520)",
    d: "M219 790A170 170 0 0 1 170 670V349A170 170 0 0 1 340 179H640A170 170 0 0 1 810 349V670A170 170 0 0 1 761 790",
    drift: { y: -36, rotation: 3 },
  },
  {
    transform: "rotate(45 818 335)",
    d: "M658 15H978A150 150 0 0 1 1128 165V505A150 150 0 0 1 978 655H658A150 150 0 0 1 508 505V165A150 150 0 0 1 658 15Z",
    drift: { y: 36, rotation: -3 },
  },
];

/** Line art for the sage bands. It draws itself, then drifts gently on scroll. */
export function Contours({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current!;
      const band = svg.parentElement!;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          svg.querySelectorAll("path"),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 3,
            ease: "power2.inOut",
            stagger: 0.3,
            scrollTrigger: { trigger: band, start: "top 80%", once: true },
          },
        );
        svg.querySelectorAll("g g").forEach((group, i) => {
          gsap.to(group, {
            ...shapes[i].drift,
            transformOrigin: "50% 50%",
            ease: "none",
            scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: 1.2 },
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 1368 875"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      className={cn("pointer-events-none absolute inset-0 size-full text-forest-700/45", className)}
    >
      <g transform="translate(229 90) scale(0.68)">
        {shapes.map(({ d, transform }) => (
          <g key={d}>
            <path data-contour="" d={d} transform={transform} pathLength={1} stroke="currentColor" strokeWidth={1.45} />
          </g>
        ))}
      </g>
    </svg>
  );
}
