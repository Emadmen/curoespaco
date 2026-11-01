# Cora — website for a psychology & therapy clinic

A Next.js website for a psychology clinic, with **appointment requests in under a minute** (no account needed) and **WhatsApp booking** on every page. Includes a protected admin area for requests, services, professionals and clinic settings.

All clinic information in this repository (name, address, team, services) is **placeholder content**. Replace it before going live (see [Content to replace](#content-to-replace)).

---

## Features

- **Public site (pt-PT):** home, Sobre Nós, Serviços (+ detail pages), Equipa (+ profiles), Espaço (gallery with lightbox), Contactos, FAQ, privacy policy and terms.
- **Booking wizard** (`/marcar-consulta`), 4 short steps:
  1. service, 2. professional (optional; "Sem preferência" is the default), 3. preferred date/time, 4. name, mobile number, optional email and consent.
  - Service and professional choices carry over from any page (`?servico=…&profissional=…`).
  - Requests are saved as `PENDING`. The success screen only appears after the server confirms the save, and it says clearly that this is a request, not a confirmed appointment.
  - Double submissions are idempotent (client key, a unique DB constraint, plus duplicate detection).
  - Validation and loading states, plus an error state with a WhatsApp fallback.
- **WhatsApp:** official `wa.me` links built by `src/lib/whatsapp.ts`, with prefilled messages (general, per service, per professional, and the full booking preferences). They contain no health information.
  - Floating button on desktop and a sticky "Marcar / WhatsApp" bar on mobile.
  - They work even when the database or booking API is down: public pages fall back to the static config.
- **Booking modes:** `REQUEST` (default; visitor states a preference) or `LIVE` (real slots from each professional's working hours). In LIVE mode, slots are re-checked on the server inside a transaction with per-professional advisory locks, so the same slot can't be booked twice.
- **Admin (`/admin`):**
  - Requests: filter, search, confirm/reject/cancel, delete (erasure), CSV export, retention purge.
  - Services and professionals: CRUD, enable/disable, photo upload, working hours.
  - Clinic settings: contacts, hours, socials, booking mode, homepage text, retention period.
- **SEO:** per-page metadata, Open Graph image, `sitemap.xml`, `robots.txt`, and `MedicalClinic` JSON-LD built only from configured data.

## Tech stack

Next.js 16 (App Router, Cache Components, `proxy.ts`) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Lucide · Motion · React Hook Form + Zod · date-fns · PostgreSQL + Prisma 7 · Vitest · Playwright.

## Getting started

Requirements: Node.js 20.9+ (tested with 22), Docker (for local PostgreSQL).

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # then edit ADMIN_EMAIL / ADMIN_PASSWORD
docker compose up -d        # PostgreSQL on localhost:5433 (+ test databases)
npx prisma migrate deploy   # create tables
npm run db:seed             # sample content + admin account
npm run dev                 # http://localhost:3000
```

Admin: http://localhost:3000/admin, using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Re-running `npm run db:seed` updates the admin password from `.env` and never overwrites content edited in the admin.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create a new migration after editing `prisma/schema.prisma` (dev only) |
| `npm run db:deploy` | Apply migrations (production/CI) |
| `npm run db:seed` | Seed sample content and create/update the admin user |
| `npm run db:purge` | Delete requests older than the retention period (schedule daily) |
| `npm test` | Unit tests + booking integration tests (needs `TEST_DATABASE_URL`) |
| `npm run test:e2e` | Playwright end-to-end tests (builds the app, uses the `cora_e2e` database) |

## Environment variables

See [`.env.example`](.env.example).

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical URL, used for metadata, sitemap and JSON-LD |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | Bootstrap admin account (password ≥ 12 chars) |
| `BOOKING_RATE_LIMIT`, `BOOKING_RATE_WINDOW_SECONDS` | no | Per-IP limit for booking requests (default 5 per 10 min) |
| `BOOKING_MIN_FILL_MS` | no | Requests submitted faster than this are treated as bots (default 2500) |
| `TEST_DATABASE_URL` | tests | Disposable database for integration tests (it gets wiped) |
| `E2E_DATABASE_URL` | e2e | Disposable database for Playwright (defaults to `cora_e2e`; it gets wiped) |

Never commit `.env`. In production, set variables in your hosting provider's secret manager.

## Project structure

```
prisma/              schema, migrations, seed
scripts/             purge-expired.ts (retention)
src/
  app/
    (site)/          public pages (layout with header, footer, floating CTAs)
      marcar-consulta/   booking page
    admin/           login + (panel) protected pages and server actions
    api/             bookings (POST), availability (GET), media, admin CSV export
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/        layout, home, booking, services, team, space, contact, admin, shared, ui
  config/clinic.ts   ← placeholder clinic data, gallery, testimonials, site settings
  content/           ← all public copy (pt-PT dictionary)
  lib/               booking, availability, whatsapp, validations, auth, data, dates…
  proxy.ts           cheap cookie gate for /admin (real checks happen server-side)
tests/               Vitest (unit + DB integration)
e2e/                 Playwright specs
```

## Content to replace

1. **Clinic settings** (name, contacts, WhatsApp number, address, hours, socials, homepage text): in the admin under *Definições*. Defaults live in `src/config/clinic.ts`.
2. **Services and professionals:** in the admin. Seed data uses fictional "Exemplo" names and placeholder registration numbers. Never publish qualifications, credentials or registration numbers that you haven't verified.
3. **Photos:**
   - Professional portraits: upload in the admin.
   - Home statement photo: `public/images/home/statement.jpg`, with its alt text in `src/content/pt-PT.ts`.
   - Clinic photos: put files in `public/images/espaco/` and set `src` on `galleryImages` in `src/config/clinic.ts`. Until then, the site shows original illustrated placeholders labelled as such.
4. **Testimonials:** `testimonials` in `src/config/clinic.ts` is empty, so the section doesn't render. Only add genuine testimonials with documented consent, and only where professional rules (e.g. the OPP code of ethics) allow it.
5. **Legal pages:** `politica-de-privacidade` and `termos-e-condicoes` are **templates** with `[a completar]` placeholders. Have them reviewed.
6. **Copy / language:** all public text is in `src/content/pt-PT.ts`. For pt-BR or English, copy the file, translate it, and switch the export in `src/content/index.ts`.

## Booking modes

- **REQUEST (default):** visitors choose a *preferred* date and an hourly time within opening hours (same-day times need 1 hour's notice; up to 90 days ahead). The clinic confirms by phone or WhatsApp. The admin row has a WhatsApp shortcut that pre-fills a confirmation message to the patient.
- **LIVE:** switch it on in *Definições*. Each professional needs a weekly schedule (admin → professional → *Horário de trabalho*). Visitors only see slots that are free; nothing is invented, and a day with no configured hours shows no slots. A LIVE request still starts as `PENDING`, so the team can follow up; the slot stays blocked while the request is `PENDING` or `CONFIRMED`.

## Testing

```bash
docker compose up -d
npm test            # 50 unit + integration tests (idempotency, concurrent double-click, double booking, …)
npm run test:e2e    # 27 Playwright tests on desktop and a 360px phone
```

The e2e tests cover: a complete booking request, a preselected therapist being kept, service preselection, validation messages, double submission, server and network failures never showing a false confirmation, WhatsApp links at every entry point, admin login/confirm/export/logout, unauthenticated and forged-session access, mobile overflow at 320/360px, the sticky mobile bar and the mobile menu.

## Deployment

The app is a standard Next.js server with PostgreSQL. It runs on Vercel, Render, Railway, Fly.io, a VPS (Docker or `npm start`), etc.

1. Provision PostgreSQL (e.g. Neon, Supabase, RDS) **in the EU** and set `DATABASE_URL`.
2. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS URL.
3. Build: `npm ci && npx prisma migrate deploy && npm run build`.
4. Once only: `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed` to create the admin and initial content.
5. Start: `npm start` (or let your platform run it).
6. Schedule `npm run db:purge` daily (cron, GitHub Action or platform scheduler).
7. Serve only over HTTPS. The app sends HSTS and other security headers (`next.config.ts`).

Notes:
- Uploaded portraits are stored in the database (`MediaAsset`), so no extra storage service is needed.
- Public pages are cached (Cache Components, `cacheLife("hours")`) and refreshed immediately after admin edits (`updateTag`).
- If you run several instances or serverless functions, replace the in-memory rate limiter (`src/lib/rate-limit.ts`) with a shared store such as Redis/Upstash. The database-level per-phone limits apply regardless.
- The client IP for rate limiting comes from `x-forwarded-for`. Make sure your proxy or platform sets it and that clients can't spoof it.

## Privacy & security

See [docs/privacy-and-security.md](docs/privacy-and-security.md). It covers what the app does and the checklist to review before production. This software doesn't make a deployment GDPR-compliant on its own.

## Assumptions & decisions

- The booking page is a dedicated route rather than a modal: it's faster to load, easy to link to, and works without JavaScript-heavy overlays.
- No transactional emails are sent: no email provider is configured. Add one (e.g. Postmark or Resend with an EU region) in `src/app/api/bookings/route.ts` after the request is saved, and update the privacy policy accordingly.
- No analytics are included. If you add any, never send booking details, names or phone numbers as events, and remember that URLs may contain `servico`/`profissional` slugs.
- The visual design follows a reference screenshot: flat sage, sand and forest bands, one grotesque typeface, hairline rules. All of it lives in one design system, documented in [docs/design-system.md](docs/design-system.md). All illustrations are original inline SVGs.
