"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";

/** Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in step. */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    const lenis = new Lenis({
      duration: 1.3,
      anchors: { offset: -96 },
      // Lenis scrolls by script, so it would move the page behind an open menu or lightbox.
      virtualScroll: () => !document.querySelector('[role="dialog"]'),
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Drop any scroll still in flight, so it can't carry over to the new page.
  useEffect(() => {
    lenisRef.current?.stop();
    lenisRef.current?.start();
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
