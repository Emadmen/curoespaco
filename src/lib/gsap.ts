"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Everything animated runs inside this query, so reduced motion gets a still page. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export const EASE = "power3.out";

export { gsap, ScrollTrigger, SplitText, useGSAP };
