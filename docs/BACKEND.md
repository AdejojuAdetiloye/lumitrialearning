# Lumetra backend (Express + Prisma + PostgreSQL)

## Setup

1. Create a PostgreSQL database and set `DATABASE_URL` in `server/.env` (copy from `server/.env.example`).

2. Install and migrate:

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run db:seed
```

3. Start the API (default `http://localhost:4000`):

```bash
npm run dev
```

4. Start the Vite app (from repo root). The dev server proxies `/api` → `http://localhost:4000` (see `vite.config.ts`).

```bash
npm run dev
```

Or run API and web in two terminals: `npm run dev:api` and `npm run dev`.

## Main API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Parent signup |
| POST | `/api/auth/login` | Parent or admin login |
| GET | `/api/auth/me` | Current user (JWT) |
| GET | `/api/pricing` | Tier prices (all countries, from DB) |
| GET | `/api/pricing/courses` | Course catalog |
| GET | `/api/parent/*` | Parent profile, children, dashboard, timetable |
| GET | `/api/parent/pending-payments` | Unpaid checkouts (PENDING) with line details (optional; dashboard also embeds per-child pending summary) |
| PATCH | `/api/parent/children/:childId` | Set `birthDate` (required for paying via “Pay now” / item checkout) |
| POST | `/api/checkout/create-order` | Create pending payment + Flutterwave hosted checkout link (parent); body includes `redirectUrl` (must match `CORS_ORIGINS` origin) |
| POST | `/api/checkout/resume-payment` | Mark an old PENDING payment failed, clone lines to a new PENDING payment, return a new Flutterwave `checkoutLink` (fresh `tx_ref`) |
| POST | `/api/checkout/flutterwave-verify` | Verify transaction after redirect (`transaction_id` and/or `tx_ref`) and activate subscriptions |
| POST | `/api/checkout/flutterwave-webhook` | Flutterwave webhooks (raw JSON; configure URL + secret hash in dashboard) |
| GET/POST | `/api/admin/*` | Admin overview, parents, payments, timetable CRUD |

## Admin

Seed creates an admin user (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Log in at `/auth/login` — you are redirected to `/dashboard/admin`.

## Flutterwave

Use your **Flutterwave** secret key (`FLUTTERWAVE_SECRET_KEY`). Checkout uses the **Standard** flow: the API returns a hosted `checkoutLink`; the parent is redirected back to `redirectUrl` with `status`, `tx_ref`, and `transaction_id`. The app then calls `flutterwave-verify` (and you should register a **webhook** for async methods like mobile money). Set `FLUTTERWAVE_SECRET_HASH` and point the webhook to `https://<your-api-host>/api/checkout/flutterwave-webhook`.

Amount and **currency** come from tier prices for the parent’s country (same as before). Ensure each currency you use is enabled on your Flutterwave account.

## Subscription period

Each successful verification sets / renews a **30-day** subscription window (`currentPeriodEnd`). You can later replace this with calendar months or recurring charges.
