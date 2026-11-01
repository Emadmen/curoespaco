"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

const inView = (el: Element) => ({ trigger: el, start: "top 88%", once: true });

/**
 * Entrance animation, on load (`immediate`) or when scrolled into view.
 * With `stagger`, animates its `[data-reveal-item]` and `[data-reveal-line]` children in turn.
 * The hidden starting state lives in globals.css, so nothing flashes before hydration.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  variant = "fade",
  immediate = false,
  stagger = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "ul" | "ol";
  variant?: "fade" | "image" | "bleed";
  immediate?: boolean;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const Component = as as ElementType;

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.matchMedia().add(MOTION_OK, () => {
        const trigger = immediate ? {} : { scrollTrigger: inView(el) };
        if (stagger) {
          gsap.fromTo(
            el.querySelectorAll("[data-reveal-line]"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.4, ease: "power3.inOut", stagger: 0.14, delay, ...trigger },
          );
          gsap.fromTo(
            el.querySelectorAll("[data-reveal-item]"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.14, delay: delay + 0.2, ...trigger },
          );
        } else if (variant === "image") {
          gsap.fromTo(
            el,
            { opacity: 0, clipPath: "inset(10% 6% 10% 6% round 1.2rem)", scale: 1.03 },
            { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 1.2rem)", scale: 1, duration: 1.6, ease: EASE, delay, ...trigger },
          );
        } else if (variant === "bleed") {
          gsap.fromTo(
            el,
            { opacity: 0, clipPath: "inset(0% 0% 0% 100%)" },
            { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power3.inOut", delay, ...trigger },
          );
        } else {
          gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: EASE, delay, ...trigger });
        }
      });
    },
    { scope: ref },
  );

  return (
    <Component ref={ref} className={className} data-reveal={stagger ? undefined : ""}>
      {children}
    </Component>
  );
}
