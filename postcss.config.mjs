// Tailwind through PostCSS works with both bundlers: Turbopack in `next dev`
// and webpack in `next build --webpack` (needed on hosts without native SWC).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
