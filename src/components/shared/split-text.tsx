"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/** Heading whose lines rise into place. SplitText keeps the full text for screen readers. */
export function SplitTitle({
  as: Tag = "h2",
  children,
  className,
  id,
  immediate = false,
  delay = 0,
  mark = false,
}: {
  as?: "h1" | "h2";
  children: string;
  className?: string;
  id?: string;
  immediate?: boolean;
  delay?: number;
  /** Sets each line on its own coral band, like text marked with a highlighter. */
  mark?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.matchMedia().add(MOTION_OK, () => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { opacity: 1 });
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.3,
              ease: "power4.out",
              stagger: 0.1,
              delay,
              ...(immediate ? {} : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
            });
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-split="">
      {/* An inline band breaks with the text, and cloning the decoration gives every line its own padded rectangle. */}
      {mark ? <span className="bg-primary box-decoration-clone px-[0.2em]">{children}</span> : children}
    </Tag>
  );
}

/** Paragraph that fades in word by word, tied to the scroll position. */
export function ScrubText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.matchMedia().add(MOTION_OK, () => {
        SplitText.create(el, {
          type: "words",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { opacity: 1 });
            const tween = gsap.fromTo(
              self.words,
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: "top 80%", end: "center 50%", scrub: 0.6 },
              },
            );
            ScrollTrigger.refresh();
            return tween;
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className} data-split="">
      {children}
    </p>
  );
}
