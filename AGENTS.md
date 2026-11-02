# AGENTS.md

NetBilling — warnet (internet cafe) billing & cashier system. UI language is Indonesian (id-ID); keep new labels in Indonesian.

## Two implementations — read carefully

This repo contains **two parallel versions** of the same app:

1. **React SPA (root) — the runnable app.** Vite + React 19 + TypeScript + Tailwind CSS 4. Fully client-side: no backend calls, all state lives in `src/context/AppContext.tsx` and persists to `localStorage`. Entry: `src/main.tsx` → `src/App.tsx` → `AppContext` + `src/components/*View.tsx`.
2. **PHP app (`billing-warnet/`) — a skeleton.** Only `index.php` (role-based redirector), `auth/login.php`, `auth/logout.php`, `config/`, `assets/`, and a SQL dump exist. The README describes many more PHP pages (`admin/`, `billing/`, `komputer/`, etc.) that are **not in the repo** — do not assume they exist or try to edit them.

The README documents the PHP version's stack (XAMPP, `pdo_pgsql`, PostgreSQL). The React version needs neither.

## Commands (use bun — `bun.lock`, not package-lock)

```bash
bun install
bun run dev      # Vite dev server on http://localhost:3000 (host 0.0.0.0)
bun run build    # production build to dist/
bun run lint    # tsc --noEmit (typecheck only — there is no test framework)
```

- `bun run clean` uses `rm -rf dist server.js` — Unix-only, fails on Windows.
- There are no tests, no formatter, and no CI config. `lint` is the only verification step.

## Architecture notes

- Path alias `@` → repo root (see `vite.config.ts` and `tsconfig.json`).
- `vite.config.ts`: HMR and file watching are disabled when `DISABLE_HMR=true`. The comment says **do not modify** this — it exists to prevent flickering during agent edits.
- `metadata.json` / `.env.example`: this SPA is deployed as an "AI Studio" applet with server-side Gemini API capability. `GEMINI_API_KEY` and `APP_URL` are injected by the platform at runtime — never commit real values (`.gitignore` already excludes `.env*` except `.env.example`).
- All app state is in `AppContext` and mirrored to `localStorage` under `nb_*` keys (`nb_users`, `nb_komputer`, `nb_pelanggan`, `nb_paket`, `nb_billing`, `nb_pembayaran`, `nb_tutup_buku`, `nb_current_user`). Seed data: `src/data/initialData.ts`. A one-time migration flag `nb_v4_clean_zero` wipes billing/payment data on first load — don't "fix" it.
- Demo accounts (both implementations): `admin` / `admin123`, `operator` / `operator123`.

## Billing business rules (`src/utils/format.ts`)

Non-obvious pricing logic — preserve when editing:

- **Normal rate:** per-hour tariff, minimum 15 billable minutes, rounded **up to the nearest Rp 500**.
- **Paket:** flat price until the package duration is exceeded; overtime billed at the PC's regular hourly rate (rounded to 500).
- **Manual mode:** flat price for a target duration (e.g. 30 min / Rp 2.000), same overtime rule beyond the target.
- The live timer in `AppContext` recomputes `total_biaya` every second for active sessions.

## PHP skeleton (`billing-warnet/`)

- DB: PostgreSQL `db_billing_warnet`; credentials in `billing-warnet/config/database.php` (defaults `postgres`/`postgres`). Requires `pdo_pgsql` enabled in `php.ini`.
- **Two schema copies exist and differ:** `database/db_billing_warnet.sql` (root, newer, more comments) and `billing-warnet/database/db_billing_warnet.sql`. Treat the root copy as canonical and update both when changing schema.
- PHP side uses bcrypt password hashing and PDO prepared statements — keep that pattern if extending it.
