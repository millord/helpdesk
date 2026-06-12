# Helpdesk — Project Memory

## Project

An AI-powered ticket management system for handling support emails. Tickets are auto-classified, summarized, and replied to using the Claude API. See `project-scope.md` for full feature list and `implementation-plan.md` for the development roadmap.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Tailwind CSS v4, React Router v7, shadcn/ui, TanStack Query v5, Axios |
| Backend | Node.js + Express 5 + TypeScript, running on Bun |
| Auth | Better Auth (database sessions) |
| Database | PostgreSQL + Prisma |
| AI | Claude API |
| Email | SendGrid or Mailgun |
| Deployment | Docker + cloud provider |
| Testing | Playwright (e2e, chromium) |

Full details in `tech-stack.md`.

## Monorepo Structure

```
/
├── client/              # React app (Vite, port 5173)
│   └── src/
├── server/              # Express API (Bun, port 3000)
│   └── src/
│       ├── routes/
│       └── middleware/
├── e2e/                 # Playwright end-to-end tests
│   └── global-setup.ts  # Creates helpdesk_test DB, runs migrations + seed
├── playwright.config.ts # Playwright config (chromium, baseURL: 5173)
├── package.json         # Bun workspace root
└── tsconfig.json        # Shared TS config
```

## Running the Project

```bash
bun run dev                            # start both client and server
bun run --filter @helpdesk/server dev  # server only (port 3000)
bun run --filter @helpdesk/client dev  # client only (port 5173)
```

Vite proxies `/api/*` → `http://localhost:3000` in development.

## Key Conventions

- All API routes are prefixed with `/api`
- Auth middleware lives in `server/src/middleware/` (`requireAuth`, `requireAdmin`)
- New route files go in `server/src/routes/` and are mounted in `server/src/routes/index.ts`
- Use `bun --watch` for hot-reload on the server (already configured in `package.json`)
- Tailwind v4: no config file — styles are imported via `@import "tailwindcss"` in `index.css`
- shadcn/ui: installed in `client/` with new-york style and default theme; add components with `npx shadcn@latest add <name>` from the `client/` directory
- shadcn imports use the `@` alias (`@/components/ui/...`), which maps to `client/src/`; alias is configured in `client/tsconfig.json` and `client/vite.config.ts`
- Use shadcn semantic color tokens (`text-destructive`, `bg-background`, etc.) instead of hardcoded Tailwind colors
- Prettier config (`.prettierrc`): `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "all"`
- **Data fetching:** use **Axios** for HTTP requests and **TanStack Query** (`useQuery`) for all client-side data fetching — no raw `fetch` or `useEffect`+`useState` patterns for API calls; `QueryClientProvider` is set up in `client/src/main.tsx`

## Authentication

Better Auth handles all auth. Key details:

- **Server config:** `server/src/lib/auth.ts` — Prisma adapter, email/password only, **sign-up is disabled** (users are seeded manually)
- **User roles:** `role` field added to the user model (`"agent"` by default); set to `"admin"` via seed script
- **Auth routes:** mounted at `/api/auth/*` via `toNodeHandler(auth)` in `server/src/index.ts`
- **Client:** `client/src/lib/auth-client.ts` exports `signIn`, `signOut`, `useSession` — import from there, not directly from `better-auth`
- **Middleware:** `requireAuth` and `requireAdmin` live in `server/src/middleware/`; both are fully implemented (Phase 2 complete)
- **Trusted origin:** `CLIENT_URL` env var (defaults to `http://localhost:5173`)
- **Route guards:** `ProtectedRoute` (any authenticated user) and `AdminRoute` (admin role only) in `client/src/components/`; wrap routes in `App.tsx`
- **Role-conditional UI:** check `(session?.user as { role?: string })?.role === "admin"` for admin-only elements (e.g. nav links)

## Seeded Users

| Email | Password | Role |
|---|---|---|
| *(set via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars)* | — | admin |
| agent@example.com | admin123 | agent |

To create additional users, use `auth.$context` internal adapter (see `server/prisma/seed.ts` for the pattern).

## Documentation

Use **Context7 MCP** to fetch current documentation for any library before writing code.

### How to use Context7

1. Call `resolve-library-id` with the library name and your question
2. Call `query-docs` with the resolved ID and your specific question
3. Use the returned docs to write accurate, up-to-date code

### Library IDs for this project

| Library | Context7 ID |
|---|---|
| Bun | `/oven-sh/bun` |
| Express | `/websites/expressjs_en_5` |
| React | `/reactjs/react.dev` |
| Prisma | resolve at query time |
| React Router | resolve at query time |
| Tailwind CSS | resolve at query time |

Always prefer Context7 over training data for library-specific syntax, configuration, and API references.
