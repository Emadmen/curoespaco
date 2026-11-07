"use client";

import { useRef, useState } from "react";
import { t } from "@/content";
import { EASE, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Reveal } from "@/components/shared/reveal";
import { ScrubText } from "@/components/shared/split-text";
import { NeuralField } from "./neural-field";
import { JourneyLeaves } from "./journey-leaves";

const steps = t.journey.steps;
const hidden = (edge: number) => `circle(0% at ${edge}% 50%)`;
const filled = (edge: number) => `circle(110% at ${edge}% 50%)`;
/** The ring's dash, a touch over one lap so the finished ring closes with no notch. */
const DASH = 1.01;
const UNDRAWN = DASH + 0.01;
/**
 * "Compreender" can show a mind at work rather than a coral fill. Switched off for now:
 * -1 matches no stage, so it takes the coral fill like "Escutar". Set it back to 1 to
 * bring the neurons back.
 */
const NEURONS: number = -1;
/**
 * "Recomeçar" can grow two branches beneath the word instead of a coral fill. Switched off
 * for now the same way as the neurons; set it back to 2 to bring the branches back.
 */
const PLANT: number = -1;
/** The branches as seedlings and grown. */
const SEEDLING = { clipPath: "inset(100% 0% 0% 0%)", scale: 0.55 };
const GROWN = { clipPath: "inset(0% 0% 0% 0%)", scale: 1 };

/**
 * The three stages of the work. Scrolling only picks the active stage: each change
 * then plays through in time, so stopping mid-scroll never leaves a half-finished
 * state. Only the ring around the active circle follows the scroll directly.
 */
export function Journey({ statement }: { statement: string }) {
  const ref = useRef<HTMLElement>(null);
  const [thinking, setThinking] = useState(false);

  useGSAP(
    () => {
      const track = ref.current!;
      gsap.matchMedia().add(MOTION_OK, () => {
        const q = gsap.utils.selector(track);
        const fills = q("[data-journey-fill]");
        const captions = q("[data-journey-caption]");
        const rings = q("[data-journey-ring]");
        const orbits = q("[data-journey-orbit]");
        const scroll = { trigger: track, start: "top top", end: "bottom bottom" };
        let current = 0;

        // The circles fill one after another and stay filled: first one, then two, then all
        // three. Each fill pours in from its overlap with the circle before it, and drains back
        // the same way when scrolling up. The neurons, when on, fade in and out instead.
        const show = (next: number) => {
          const previous = current;
          const forward = next > previous;
          const ease = "power2.inOut";
          current = next;
          setThinking(next === NEURONS);
          fills.forEach((fill, i) => {
            const was = i <= previous;
            const now = i <= next;
            if (was === now) return;
            // Several circles can change at once after a fast scroll; they follow one another.
            const delay = 0.1 + 0.25 * (forward ? i - previous - 1 : previous - i);
            if (i === NEURONS) gsap.to(fill, { opacity: now ? 1 : 0, duration: 0.6, delay, ease, overwrite: true });
            else
              gsap.to(fill, { clipPath: now ? filled(0) : hidden(0), duration: now ? 0.9 : 0.7, delay, ease, overwrite: true });
          });
          gsap.to(captions[previous], { opacity: 0, y: forward ? -8 : 8, duration: 0.3, overwrite: true });
          gsap.fromTo(
            captions[next],
            { opacity: 0, y: forward ? 8 : -8 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: EASE, overwrite: true },
          );
        };

        const row = { trigger: q("[data-journey-row]")[0], start: "top 85%", once: true };
        gsap.from(q("[data-journey-circle]"), { opacity: 0, scale: 0.92, duration: 1.4, ease: EASE, stagger: 0.15, scrollTrigger: row });
        gsap.set(fills[0], { clipPath: filled(0) });
        // The leaves sway on their stems, each at its own pace, as if in a light breeze.
        q("[data-journey-leaf]").forEach((leaf) => {
          gsap.to(leaf, {
            rotation: gsap.utils.random(6, 12) * (Math.random() < 0.5 ? -1 : 1),
            y: gsap.utils.random(-6, 6),
            duration: gsap.utils.random(3, 5.5),
            delay: gsap.utils.random(0, 2),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
        gsap.to(q("[data-journey-texture]"), { rotation: 90, ease: "none", scrollTrigger: { ...scroll, scrub: 1 } });
        // The branches grow from their stems through the last stage.
        const plants = q("[data-journey-plant]");
        const growth = plants.length ? gsap.fromTo(plants, SEEDLING, { ...GROWN, ease: "none", paused: true }) : null;

        ScrollTrigger.create({
          ...scroll,
          onUpdate: ({ progress }) => {
            const position = progress * steps.length;
            const step = Math.min(steps.length - 1, Math.floor(position));
            const within = position - step;
            // Set directly: GSAP rounds this value to a whole number, and the ring only spans 0 to 1.
            rings.forEach((ring, i) => ring.setAttribute("stroke-dashoffset", String(i < step ? 0 : i > step ? UNDRAWN : DASH * (1 - within))));
            orbits.forEach((orbit, i) => gsap.set(orbit, { rotation: i === step ? within * 360 : 0, opacity: i === step ? 1 : 0 }));
            if (growth) gsap.to(growth, { progress: step === PLANT ? Math.min(1, within * 1.15) : 0, duration: 0.6, ease: "power2.out", overwrite: true });
            if (step !== current) show(step);
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label={t.journey.eyebrow} data-journey-track="" className="relative overflow-x-clip">
      {/* On phones the content is shorter than the screen, so it starts under the header instead of centring. */}
      <div className="sticky top-0 flex min-h-svh flex-col justify-center pt-24 pb-28 max-sm:justify-start lg:pb-8">
        {/* Fine branches reach in from the left and right edges and thin to twigs as they near the
            middle, fading out before the text. It lives in the pinned block, so it holds still
            while the steps play. The SVG is a mask, so its colour is ours. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 aspect-[20/9] mask-[linear-gradient(to_right,black_4%,transparent_30%,transparent_70%,black_96%)]"
        >
          <div className="size-full bg-coral-600 opacity-80 mask-[url(/images/home/branches-seam.svg)] mask-size-[100%_auto] mask-top mask-no-repeat" />
        </div>
        <JourneyLeaves />
        <div className="container-page relative text-center">
          <Reveal className="flex justify-center">
            <p className="eyebrow">{t.journey.eyebrow}</p>
          </Reveal>
          <ScrubText className="mx-auto mt-5 max-w-[24em] text-balance type-display-md font-light">{statement}</ScrubText>

          <ol
            data-journey-row=""
            className="mx-auto mt-10 flex w-[min(100%,calc((100svh-27rem)*2.78))] lg:mt-12"
          >
            {steps.map(({ title }, i) => (
              <li
                key={title}
                data-journey-circle=""
                className="relative grid aspect-square w-[35.97%] place-items-center rounded-full border not-first:-ml-[3.96%]"
              >
                <span className="text-sm sm:text-xl">{title}</span>
                {i === NEURONS ? (
                  <div
                    data-journey-fill=""
                    aria-hidden="true"
                    style={{ opacity: 0 }}
                    className="absolute inset-0 grid place-items-center overflow-hidden rounded-full bg-sage-100"
                  >
                    <NeuralField active={thinking} className="absolute inset-0" />
                    <span className="relative text-sm sm:text-xl">{title}</span>
                  </div>
                ) : (
                  <div
                    data-journey-fill=""
                    aria-hidden="true"
                    style={i === 0 ? undefined : { clipPath: hidden(0) }}
                    className={`absolute inset-0 grid place-items-center overflow-hidden rounded-full text-forest-900 ${i === PLANT ? "bg-background" : ""}`}
                  >
                    {i !== PLANT && <div data-journey-texture="" className="ember absolute -inset-[20%]" />}
                    {i === PLANT && (
                      <>
                        {/* The same branch twice, mirrored, springing from below the word and opening outwards. */}
                        {["left-[15%]", "right-[15%] -scale-x-100"].map((side) => (
                          <div key={side} className={`absolute bottom-[7%] aspect-[1663/1811] h-[38%] ${side}`}>
                            <div
                              data-journey-plant=""
                              className="size-full origin-bottom bg-forest-900 mask-[url(/images/home/journey-branch.svg)] mask-contain mask-no-repeat"
                            />
                          </div>
                        ))}
                      </>
                    )}
                    <span className="relative text-sm sm:text-xl">{title}</span>
                  </div>
                )}
                <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 overflow-visible">
                  <circle
                    data-journey-ring=""
                    cx="50"
                    cy="50"
                    r="50"
                    fill="none"
                    pathLength={1}
                    strokeDasharray={`${DASH} 2`}
                    strokeDashoffset={UNDRAWN}
                    strokeWidth={0.35}
                    className="stroke-coral-500"
                  />
                </svg>
                <div data-journey-orbit="" aria-hidden="true" className={i === 0 ? "absolute inset-0" : "absolute inset-0 opacity-0"}>
                  <span className="absolute top-0 left-1/2 box-content size-2 -translate-1/2 rounded-full border-2 border-background bg-coral-500 sm:size-2.5" />
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-xl font-light italic sm:text-2xl lg:mt-10">{t.journey.title}</p>
          <div className="mt-2 grid gap-1 text-muted-foreground">
            {steps.map(({ title, text }) => (
              <p key={title} data-journey-caption="">
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
