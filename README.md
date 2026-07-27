# arc ai

ChatGPT/Claude-style AI chat and coding assistant platform. Built incrementally through **Phase 9**: scaffold/auth/schema, streaming chat, credit ledger enforcement, Dodo Payments checkout/webhooks (including custom-amount top-ups), a sandboxed coding agent (E2B), a billing/account page with paginated usage history, a polish pass (mobile-responsive collapsible sidebars, inline error states, streaming loading indicators, and stronger empty states), a branded redesign (gradient logo/favicon, dark/light toggle, Terms & Support pages, site header/footer, a custom account menu, `/settings`, `/changelog`), and a Windows desktop app that runs the coding agent locally on the user's own machine with a permission system, plus a unified `/home` dashboard and a `/download` page.

## Stack

- Next.js (App Router) + TypeScript + Tailwind — frontend and backend (API routes)
- PostgreSQL via Prisma
- Redis (provisioned now, wired up in a later phase)
- Auth: [Clerk](https://clerk.com) (email + Google OAuth)
- Sandbox: [E2B](https://e2b.dev)
- Payments (later phase): [Dodo Payments](https://dodopayments.com)

## Setup

### 1. Start local Postgres + Redis

```bash
docker compose up -d
```

### 2. Configure environment variables

Copy `.env.example` to `.env` if you haven't already (a working `.env` with local DB/Redis defaults is already present for dev). Then fill in your Clerk keys:

1. Create an app at [dashboard.clerk.com](https://dashboard.clerk.com), enable Email and Google as sign-in options.
2. Copy the Publishable Key and Secret Key into `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. In the Clerk dashboard, add a webhook endpoint pointing at `<your-url>/api/webhooks/clerk` subscribed to the `user.created` event, and copy its signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`. For local dev, use a tunnel (e.g. `ngrok http 3000`) so Clerk can reach your machine.

Optionally fill in `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` to get real streamed chat responses (chat works without them, but shows a "model not configured" error).

To exercise checkout/billing, create a [Dodo Payments](https://dodopayments.com) account, then:
1. Create two products: a subscription product (Pro) and a one-time product (credit top-up); copy their ids into `DODO_PRO_PRODUCT_ID` / `DODO_TOPUP_PRODUCT_ID`.
2. **For the custom-dollar-amount top-up form on `/billing` to work**, the top-up product must be configured as **"pay what you want"** in the Dodo dashboard — otherwise Dodo ignores the amount the checkout route sends and charges the product's fixed price instead. `DODO_CREDITS_PER_DOLLAR` (default `100`) controls how many credits each dollar grants.
3. Copy your test-mode API key into `DODO_PAYMENTS_API_KEY`.
4. Add a webhook endpoint pointing at `<your-url>/api/webhooks/dodo` (again needs a tunnel for local dev) and copy its signing key into `DODO_PAYMENTS_WEBHOOK_KEY`.

To try the coding agent, sign up at [e2b.dev](https://e2b.dev) and copy your API key into `E2B_API_KEY` (agent mode works without it, but shows a "sandbox not configured" error and never spends sandbox credits).

### 3. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev --name init
```

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Signing up should redirect you to `/home`, which shows your email, starting credit balance (granted via the Clerk webhook), and your recent chats/code sessions.

## Desktop app (Windows)

The `electron/` folder is a small, separate Electron project (its own `package.json`) that opens the same web app in a native window and adds one extra capability the browser can't: a coding-agent session whose `read_file`/`write_file`/`run_command` tools run for real on the user's own computer, inside a folder they pick, gated by an approve/deny prompt for every action (`components/agent/ToolPermissionPrompt.tsx`). Browser-only usage is untouched — cloud sandbox sessions (E2B) still work exactly as before; local execution is only offered when the app detects it's running inside the Electron shell (`window.arcDesktop`).

Setup:

```bash
npm run electron:install   # npm install inside electron/, once
```

Run in dev (with `npm run dev` already running on port 3100 in another terminal):

```bash
npm run electron:dev
```

By default the desktop shell points at `http://localhost:3100`; set `ARC_WEB_URL` to point it at a deployed URL instead.

Build a Windows installer:

```bash
npm run electron:build
```

This produces `electron/dist-installer/Arc AI Setup <version>.exe` via `electron-builder`. Two things you'll need to do yourself before shipping it to real users:

1. **Code-sign it.** The build above is unsigned — Windows SmartScreen will warn on install until you sign the `.exe` with a purchased code-signing certificate.
2. **Host it and set `NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL`** to wherever you upload it (e.g. a GitHub Release asset URL). The `/download` page reads this env var and shows a "not configured yet" message until it's set.

## Database

Schema lives in [`prisma/schema.prisma`](prisma/schema.prisma). Tables: `users`, `subscriptions`, `credit_ledger` (append-only — never updated or deleted, only inserted into), `conversations` (has a `mode`: `CHAT` or `AGENT`), `messages`, `sandbox_sessions` (one per agent conversation, tracks the E2B sandbox lifecycle and credit charge), `processed_webhook_events` (idempotency guard for the Dodo webhook).

Inspect data with:

```bash
npx prisma studio
```
