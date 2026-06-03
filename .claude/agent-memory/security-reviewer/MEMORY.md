# Memory Index

- [Project Auth Posture](project_auth_posture.md) — requireAuth/requireAdmin are stubs; all API routes are effectively public
- [Hardcoded Credentials](hardcoded_credentials.md) — weak default passwords in .env and seed scripts; BETTER_AUTH_SECRET present
- [Client-Side Only Authorization](client_side_authz.md) — frontend guards work but backend enforces nothing; auth-client.ts hardcodes localhost URL
