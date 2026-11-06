"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Neuron = { x: number; y: number; r: number; phase: number; speed: number; depth: number; glow: number };
type Signal = { from: number; to: number; t: number; duration: number };

const COUNT = 38;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** A seeded random, so the network keeps the same shape on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/** Neurons scattered over a disc, each joined to its three nearest neighbours. */
function network() {
  const random = seeded(7);
  const neurons: Neuron[] = [];
  while (neurons.length < COUNT) {
    const x = random() * 2 - 1;
    const y = random() * 2 - 1;
    const depth = Math.hypot(x, y);
    if (depth > 0.86 || neurons.some((n) => Math.hypot(n.x - x, n.y - y) < 0.2)) continue;
    neurons.push({ x, y, r: 1 + random() * 1.4, phase: random() * Math.PI * 2, speed: 0.3 + random() * 0.4, depth, glow: 0 });
  }
  const links: number[][] = neurons.map(() => []);
  neurons.forEach((n, i) => {
    neurons
      .map((m, j) => [j, Math.hypot(m.x - n.x, m.y - n.y)] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .forEach(([j]) => {
        if (links[i].includes(j)) return;
        links[i].push(j);
        links[j].push(i);
      });
  });
  return { neurons, links, random };
}

/**
 * A small network of neurons that drift and pass signals to one another. It fires
 * as soon as it becomes active, and stops drawing soon after it is put away. The
 * middle, where the label sits, is kept quiet.
 */
export function NeuralField({ active, className }: { active: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const context = canvas.getContext("2d");
    if (!context) return;
    const colour = getComputedStyle(canvas).getPropertyValue("--color-coral-500").trim() || "#f8b9a2";
    const { neurons, links, random } = network();
    const signals: Signal[] = [];
    let frame = 0;
    let begun = 0;
    let last = 0;
    let spawn = 0;

    const fire = (from: number, except = -1) => {
      const next = links[from].filter((j) => j !== except);
      if (!next.length) return;
      signals.push({ from, to: next[Math.floor(random() * next.length)], t: 0, duration: 0.5 + random() * 0.5 });
    };

    const draw = (now: number) => {
      begun ||= now;
      const seconds = (now - begun) / 1000;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;

      const ratio = window.devicePixelRatio || 1;
      const size = canvas.clientWidth;
      if (canvas.width !== Math.round(size * ratio)) canvas.width = canvas.height = Math.round(size * ratio);
      const half = canvas.width / 2;
      const unit = ratio * Math.max(0.55, size / 330);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = context.strokeStyle = colour;

      const points = neurons.map((n) => ({
        x: half + (n.x + Math.sin(seconds * n.speed + n.phase) * 0.03) * half,
        y: half + (n.y + Math.cos(seconds * n.speed * 0.8 + n.phase) * 0.03) * half,
      }));
      // Fainter across the band where the label sits.
      const quiet = (x: number, y: number) => {
        const reach = Math.hypot((x - half) / half / 0.55, (y - half) / half / 0.18);
        return 0.12 + 0.88 * clamp((reach - 0.8) / 0.8);
      };

      context.lineWidth = 0.8 * unit;
      links.forEach((ends, i) =>
        ends.forEach((j) => {
          if (j < i) return;
          const [a, b] = [points[i], points[j]];
          context.globalAlpha = 0.4 * quiet((a.x + b.x) / 2, (a.y + b.y) / 2);
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }),
      );

      if (active) {
        spawn -= dt;
        if (spawn <= 0 && signals.length < 16) {
          fire(Math.floor(random() * COUNT));
          spawn = 0.1 + random() * 0.15;
        }
      }
      for (let k = signals.length - 1; k >= 0; k--) {
        const signal = signals[k];
        signal.t += dt / signal.duration;
        if (signal.t >= 1) {
          signals.splice(k, 1);
          neurons[signal.to].glow = 1;
          // Most signals carry on to a neighbour, so firing runs along the network.
          if (random() < 0.55) fire(signal.to, signal.from);
          continue;
        }
        const [a, b] = [points[signal.from], points[signal.to]];
        const x = a.x + (b.x - a.x) * signal.t;
        const y = a.y + (b.y - a.y) * signal.t;
        const fade = quiet(x, y);
        context.globalAlpha = 0.18 * fade;
        context.beginPath();
        context.arc(x, y, 4.5 * unit, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = fade;
        context.beginPath();
        context.arc(x, y, 1.6 * unit, 0, Math.PI * 2);
        context.fill();
      }

      neurons.forEach((n, i) => {
        const { x, y } = points[i];
        const fade = quiet(x, y);
        n.glow = Math.max(0, n.glow - dt * 1.6);
        if (n.glow) {
          context.globalAlpha = 0.25 * n.glow * fade;
          context.beginPath();
          context.arc(x, y, (n.r + 7 * n.glow) * unit, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = (0.55 + 0.45 * n.glow) * fade;
        context.beginPath();
        context.arc(x, y, (n.r + 1.5 * n.glow) * unit, 0, Math.PI * 2);
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    if (!active) {
      // Keep drawing while the field fades out, then rest.
      const rest = setTimeout(() => cancelAnimationFrame(frame), 900);
      frame = requestAnimationFrame(draw);
      return () => {
        clearTimeout(rest);
        cancelAnimationFrame(frame);
      };
    }
    // Several neurons fire at once, so the field is busy as soon as it shows.
    for (let k = 0; k < 8; k++) fire(Math.floor(random() * COUNT));
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <canvas ref={ref} aria-hidden="true" className={cn("size-full", className)} />;
}
