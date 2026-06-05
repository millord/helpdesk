import 'dotenv/config';
import { auth } from '../src/lib/auth';
import { Role } from '../src/generated/prisma/enums';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env',
    );
    process.exit(1);
  }

  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`Admin user ${email} already exists, skipping.`);
    process.exit(0);
  }

  const user = await ctx.internalAdapter.createUser({
    email,
    name: 'Admin',
    emailVerified: true,
    role: Role.admin,
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

  console.log(`✓ Admin user created: ${user.email}`);
}

main();
