---
name: hardcoded-credentials-env
description: Weak/default credentials and a real BETTER_AUTH_SECRET committed or present in server/.env
metadata:
  type: project
---

`server/.env` (not committed to git, but present on disk) contains:
- `DATABASE_URL` with password `admin123`
- `SEED_ADMIN_PASSWORD=admin123` — the seeded admin account uses this trivially guessable password
- `BETTER_AUTH_SECRET` is a real secret, not a placeholder

`server/.env.example` also ships with `yourpassword` as the DB password placeholder, which is fine.

The agent account is seeded in CLAUDE.md with `agent@example.com / admin123` as a hardcoded credential.

**Why:** Weak defaults that developers copy from .env.example or seed scripts into production.

**How to apply:** When reviewing seed scripts, deployment docs, or env files, flag any weak/default passwords and remind to rotate BETTER_AUTH_SECRET before production.
