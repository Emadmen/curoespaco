/**
 * Loose leaves scattered among the branches at the edges of the journey, kept clear of the
 * text in the middle. Each one sways gently once the journey's motion starts (see
 * `data-journey-leaf` in journey.tsx); with reduced motion they simply rest in place.
 */
const LEAVES = [
  // Left side
  { x: 4, y: 14, size: 2.6, rotate: -35, tone: "fill-coral-500", outline: false },
  { x: 15, y: 30, size: 1.7, rotate: 50, tone: "fill-coral-400", outline: true },
  { x: 8, y: 52, size: 3.1, rotate: 20, tone: "fill-coral-600", outline: false },
  { x: 19, y: 63, size: 1.9, rotate: -70, tone: "fill-coral-500", outline: true },
  { x: 3, y: 80, size: 2.2, rotate: 115, tone: "fill-coral-400", outline: false },
  { x: 13, y: 90, size: 1.5, rotate: -10, tone: "fill-coral-600", outline: true },
  // Right side
  { x: 93, y: 10, size: 2, rotate: 140, tone: "fill-coral-400", outline: true },
  { x: 83, y: 24, size: 2.8, rotate: -25, tone: "fill-coral-500", outline: false },
  { x: 95, y: 42, size: 1.6, rotate: 70, tone: "fill-coral-600", outline: false },
  { x: 80, y: 58, size: 2, rotate: 160, tone: "fill-coral-500", outline: true },
  { x: 90, y: 72, size: 3, rotate: -55, tone: "fill-coral-400", outline: false },
  { x: 84, y: 88, size: 1.7, rotate: 30, tone: "fill-coral-600", outline: true },
];

export function JourneyLeaves() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden max-sm:opacity-60">
      {LEAVES.map(({ x, y, size, rotate, tone, outline }, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${x}%`, top: `${y}%`, width: `${size}rem`, rotate: `${rotate}deg` }}
        >
          <svg data-journey-leaf="" viewBox="0 0 40 80" className="block w-full origin-bottom overflow-visible">
            <path
              d="M20 78C6 62 2 38 9 22 13 13 17 7 20 2c3 5 7 11 11 20 7 16 3 40-11 56Z"
              className={outline ? "fill-none stroke-coral-600" : `${tone} opacity-70`}
              strokeWidth={outline ? 1.5 : 0}
            />
            <path
              d="M20 78V10M20 60l-7-8m7-6 8-9m-8-5-6-7"
              fill="none"
              strokeWidth={1.2}
              strokeLinecap="round"
              className={outline ? "stroke-coral-600" : "stroke-background/70"}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
