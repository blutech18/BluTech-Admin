# BluTech Admin — Content Management & Commission Dashboard

BluTech Admin is the backend management panel for the BluTech portfolio site. It provides a secure, authenticated interface for managing all dynamic content that appears on the public-facing site — services, projects, and incoming commission requests.

## What It Does

- **Services Management** — Full CRUD for the "What I Do" section. Each service has an icon, title, description, tags, sort order, and active/hidden toggle. Changes reflect on both the service cards and the marquee carousel on the user site.
- **Projects Management** — Full CRUD for both the Showcase (featured projects) and Complete Portfolio sections. Supports title, category, year, description, detailed about text, tech stack tags, gradient color selection, featured flag, and visibility toggle.
- **Commissions Dashboard** — View all incoming project requests from the commission form. Update status (pending, reviewed, accepted, rejected, completed), add internal admin notes, and delete entries. Email notifications are sent to the admin on every new submission.

## Tech Stack

- **Framework** — TanStack Start (React 19 + TanStack Router)
- **Hosting** — Cloudflare Workers (edge deployment)
- **Database** — Neon PostgreSQL (shared with the user site)
- **State Management** — Zustand
- **Styling** — Tailwind CSS v4
- **Validation** — Zod
- **UI** — Lucide Icons, Sonner (toast notifications)

## Security

- **Authentication** — Single admin account with PBKDF2 password hashing (100k iterations, 32-byte salt, Web Crypto API)
- **Sessions** — JWT tokens stored in httpOnly, secure, sameSite=strict cookies with 8-hour expiry
- **Brute Force Protection** — 5 login attempts per 15 minutes per IP, automatic IP block after 10 failures (30-minute cooldown)
- **Rate Limiting** — Sliding window rate limiter on all endpoints
- **Input Security** — XSS sanitization and SQL injection pattern detection on all create/update operations, parameterized queries throughout
- **Audit Logging** — All login attempts, failures, blocks, and logouts recorded in the database
- **Security Headers** — CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, X-Robots-Tag noindex
- **Hidden from Search** — noindex/nofollow meta tags and X-Robots-Tag header
