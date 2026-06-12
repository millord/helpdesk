import 'dotenv/config';
import { auth } from '../src/lib/auth';
import { Role } from '../src/generated/prisma/enums';

async function createUser(
  ctx: Awaited<typeof auth.$context>,
  email: string,
  name: string,
  password: string,
  role: Role,
) {
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const user = await ctx.internalAdapter.createUser({
    email,
    name,
    emailVerified: true,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const hashed = await ctx.password.hash(password);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: email,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✓ User created: ${user.email} (${role})`);
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env',
    );
    process.exit(1);
  }

  const ctx = await auth.$context;

  await createUser(ctx, adminEmail, 'Admin', adminPassword, Role.admin);
  await createUser(ctx, 'agent@example.com', 'Agent', 'admin123', Role.agent);
}

main();
