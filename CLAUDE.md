# Helpdesk — Project Memory

## Project

An AI-powered ticket management system for handling support emails. Tickets are auto-classified, summarized, and replied to using the Claude API. See `project-scope.md` for full feature list and `implementation-plan.md` for the development roadmap.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Tailwind CSS v4, React Router v7 |
| Backend | Node.js + Express 5 + TypeScript, running on Bun |
| Auth | Database sessions |
| Database | PostgreSQL + Prisma |
| AI | Claude API |
| Email | SendGrid or Mailgun |
| Deployment | Docker + cloud provider |

Full details in `tech-stack.md`.

## Monorepo Structure

```
/
├── client/         # React app (Vite, port 5173)
│   └── src/
├── server/         # Express API (Bun, port 3000)
│   └── src/
│       ├── routes/
│       └── middleware/
├── package.json    # Bun workspace root
└── tsconfig.json   # Shared TS config
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
