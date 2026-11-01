# Privacy & security

This is a healthcare-adjacent website. The application is built to minimise data, but **the clinic (data controller) is responsible for compliance**. Review everything below with your DPO or legal adviser before going live.

## What the application does

### Data minimisation
- The booking form only collects: name, mobile number, optional email, the service, the professional (optional), the preferred date/time, and the consent timestamp and version (`siteConfig.consentVersion`).
- There are no free-text fields. The form explicitly asks visitors **not** to share clinical information. The server schema ignores unknown fields.
- WhatsApp messages and URLs only ever contain service, professional, date and time. They never include names, phone numbers or health details.
- No analytics, advertising pixels or tracking cookies. The only cookie is the httpOnly admin session cookie.
- Google Maps only loads after the visitor clicks *Mostrar mapa*.

### Protection
- **Admin auth:** scrypt password hashes. Random 256-bit session tokens are stored only as SHA-256 hashes in the database; the cookie is `httpOnly`, `SameSite=Lax`, `Secure` in production, and expires after 8 hours. Logout deletes the session.
- **Authorisation:** `src/proxy.ts` blocks requests without a cookie. Every admin page, server action and admin API also validates the session against the database (`requireAdmin` / `getCurrentAdmin`).
- **Login hardening:** rate limited per IP and per account; constant-time comparison; a dummy hash is checked for unknown emails, so timing doesn't reveal which emails exist.
- **Public form abuse protection:** per-IP rate limit, a honeypot field, a minimum fill time, a same-origin check, an 8 KB body limit, and a per-phone cap of 3 pending requests per 24 hours (enforced in the database).
- **Validation:** Zod on the client *and* the server; the server also checks that the service and professional exist, are enabled and match, and that the date is open and within the booking horizon.
- **Logging:** the structured logger (`src/lib/logger.ts`) only records event names, ids and error codes, never personal data. Nothing personal is logged in the browser.
- **CSV export:** admin only, `no-store`, and protected against spreadsheet formula injection.
- **Uploads:** JPG/PNG/WebP only, max 2 MB, checked by magic bytes, and served with `nosniff`.
- **Headers:** HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `noindex` plus `no-store` on admin pages.

### Retention & deletion
- `ClinicSettings.retentionDays` (default 365) sets how long requests are kept.
- `npm run db:purge` (schedule it daily) and the admin button *Eliminar pedidos antigos* delete older requests.
- Individual requests can be permanently deleted from the admin (*Eliminar dados*), e.g. after an erasure request.
- Removing a service or professional keeps a name snapshot on existing requests. Delete those requests as well if they need to go.

## Checklist before production

- [ ] Complete and legally review the privacy policy and terms (`src/app/(site)/politica-de-privacidade`, `termos-e-condicoes`): controller identity, NIF, legal bases, DPO contact.
- [ ] Confirm the legal basis for processing booking data and whether consent is the right basis (the checkbox text is in `src/content/pt-PT.ts`; bump `consentVersion` when it changes).
- [ ] Choose an EU-hosted database and hosting provider; sign data processing agreements (DPAs); enable encryption at rest and automated backups, with a retention policy for the backups too.
- [ ] Decide the retention period and schedule `npm run db:purge`.
- [ ] Use a strong, unique admin password; restrict who has admin access; consider adding 2FA or SSO if several people need access.
- [ ] Use a shared rate-limit store if you run more than one server instance.
- [ ] Make sure your proxy sets `x-forwarded-for` correctly.
- [ ] Record this processing in your records of processing activities (art. 30 GDPR).
- [ ] Decide how WhatsApp is used. It is a third-party (Meta) channel: tell patients, and avoid clinical conversations there.
- [ ] If you add email notifications or analytics, update the privacy policy, keep payloads minimal, and never send health data.
- [ ] Testimonials: publish only genuine ones with written consent, and only where professional rules allow it.
- [ ] Verify every professional's name, title and registration number (e.g. OPP cédula) before publishing.
- [ ] Keep the *Livro de Reclamações* link (mandatory in Portugal) and the emergency notice (112 / SNS 24).
