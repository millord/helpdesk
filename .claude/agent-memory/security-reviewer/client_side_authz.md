---
name: client-side-only-authz
description: Frontend AdminRoute/ProtectedRoute guards have no backend enforcement — all authorization is client-side only
metadata:
  type: project
---

`AdminRoute` and `ProtectedRoute` in `client/src/components/` perform role and session checks correctly on the frontend. However, because backend middleware (`requireAuth`, `requireAdmin`) are stubs, the backend enforces nothing. Any API call made directly (curl, Postman, etc.) bypasses all access controls.

Additionally, `auth-client.ts` hardcodes `baseURL: "http://localhost:3000"` — this must be replaced with an environment variable before production deployment, or session cookies won't be sent to the correct origin.

**How to apply:** When reviewing any new page or API route pair, verify both sides are enforcing the check — not just the React component.

Related: [[project-auth-posture]]
