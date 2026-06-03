# Security Review — Auth & Authorization

> Generated: 2026-06-03

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 2 |
| HIGH | 2 |
| MEDIUM | 3 |
| LOW | 3 |

**Overall posture: 2/5** — Architecture is sound, but stub middleware leaves the entire API unprotected.

---

## CRITICAL

### 1. Auth Middleware Stubs Pass Every Request Unconditionally

**Files:** `server/src/middleware/requireAuth.ts`, `server/src/middleware/requireAdmin.ts`

Both middleware call `next()` immediately without session validation. Every route using these is fully public.

**Fix:**

```typescript
// server/src/middleware/requireAuth.ts
import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).user = session.user;
  (req as any).session = session.session;
  next();
}
```

```typescript
// server/src/middleware/requireAdmin.ts
import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
// Always apply AFTER requireAuth in the middleware chain
```

---

### 2. Hardcoded Weak Credentials

**Files:** `server/.env`, `server/prisma/seed.ts`

- Both admin and agent accounts use `admin123`
- `BETTER_AUTH_SECRET` is a real value (not a placeholder) and may be shared across environments

**Fix:**
1. Change all seeded passwords to strong, randomly generated values before any shared deployment
2. Rotate `BETTER_AUTH_SECRET` per environment: `openssl rand -base64 32`
3. Add a startup guard (see Finding 9)

---

## HIGH

### 3. Client-Side-Only Authorization

**Files:** `client/src/components/AdminRoute.tsx`, `client/src/components/ProtectedRoute.tsx`

Role checks exist only in React. An authenticated agent can call admin API endpoints directly via `curl` or DevTools — the server does not enforce roles. Blocked by Finding 1 (fix that first).

**Fix:** Apply middleware in route definitions when Phase 3 routes are added:

```typescript
// server/src/routes/index.ts
router.use("/users", requireAuth, requireAdmin, usersRouter);
router.use("/tickets", requireAuth, ticketsRouter);
```

---

### 4. Hardcoded `baseURL` in Auth Client

**File:** `client/src/lib/auth-client.ts:4`

```typescript
// current — broken in production, uses http://
baseURL: "http://localhost:3000"
```

**Fix:**

```typescript
// client/src/lib/auth-client.ts
export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});
```

Set `VITE_API_URL=https://api.yourdomain.com` in the production build environment.

---

## MEDIUM

### 5. No Rate Limiting on Login Endpoint

**File:** `server/src/index.ts`

`POST /api/auth/sign-in/email` has no throttle. Combined with `admin123` passwords, a brute-force attack succeeds instantly.

**Fix:**

```typescript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

app.use("/api/auth/sign-in", authLimiter);
// Mount BEFORE the Better Auth handler
app.all("/api/auth/{*any}", toNodeHandler(auth));
```

---

### 6. Missing Security Headers

**File:** `server/src/index.ts`

No `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, or `Referrer-Policy` headers.

**Fix:**

```bash
bun add helmet
```

```typescript
import helmet from "helmet";
app.use(helmet()); // before all route handlers
```

---

### 7. `role` Field Potentially User-Settable (Privilege Escalation)

**File:** `server/src/lib/auth.ts`

`additionalFields` without `input: false` may allow an agent to call `PATCH /api/auth/update-user` with `{ "role": "admin" }` and self-escalate.

**Fix:**

```typescript
user: {
  additionalFields: {
    role: {
      type: "string",
      required: true,
      defaultValue: "agent",
      input: false,  // prevents users from setting this via the API
    },
  },
},
```

---

## LOW

### 8. Session Cookie Security Flags Not Explicitly Configured

**File:** `server/src/lib/auth.ts`

`secure`, `sameSite`, and cookie name are not explicitly set. A misconfigured deployment could silently expose sessions over HTTP.

**Fix:** Explicitly configure cookie options in the Better Auth config and ensure your reverse proxy enforces HTTPS.

---

### 9. `BETTER_AUTH_SECRET` Not Validated at Startup

**Files:** `server/src/lib/auth.ts`, `server/src/index.ts`

Server starts even if the secret is missing or empty. Better Auth may fall back to a weak default.

**Fix:**

```typescript
// top of server/src/index.ts, before app initialization
if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.error("FATAL: BETTER_AUTH_SECRET is missing or too short. Exiting.");
  process.exit(1);
}
```

---

### 10. Brief Unauthenticated Render Window During Session Load

**Files:** `client/src/components/ProtectedRoute.tsx`, `client/src/components/AdminRoute.tsx`

While `isPending` is true, the guards render a spinner — not protected content. Current implementation is correct. No action needed once backend middleware is in place.

---

## Fix Order

1. **Finding 1** — implement real middleware (unblocks Finding 3)
2. **Finding 7** — add `input: false` to `role` (one-line, do it now)
3. **Finding 2** — rotate all credentials before any shared environment
4. **Finding 5** — add rate limiting to login
5. **Finding 6** — add Helmet
6. **Finding 4** — env-drive the auth client `baseURL`
7. **Findings 8 & 9** — harden cookie config and add secret validation at startup
