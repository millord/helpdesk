---
name: project-auth-posture
description: Auth and authorization security posture of the Helpdesk project — stub middleware is the dominant risk
metadata:
  type: project
---

Both `requireAuth` and `requireAdmin` middleware in `server/src/middleware/` are **stubs** — they unconditionally call `next()` with a TODO comment ("Phase 2"). This means every API route is completely unauthenticated at the backend level, regardless of what the frontend guards do. This is the single most critical systemic issue in the codebase.

**Why:** Development is phased; auth middleware was scaffolded but not yet implemented. The risk is that future route additions may ship before Phase 2 is completed.

**How to apply:** Every security review of new API routes must verify whether the stub has been replaced. Until it is, flag all API routes as effectively public. Treat any new route that uses `requireAuth` or `requireAdmin` as still unprotected.

Related: [[client-side-only-authz]], [[hardcoded-credentials-env]]
