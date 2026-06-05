import { execSync } from 'child_process';
import path from 'path';
import { Client } from 'pg';

const TEST_DATABASE_URL =
  'postgresql://postgres:admin123@localhost:5432/helpdesk_test?schema=public';

const SERVER_DIR = path.join(__dirname, '..', 'server');

async function createTestDatabase() {
  const url = new URL(TEST_DATABASE_URL);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: 'postgres',
  });

  await client.connect();

  const { rows } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'helpdesk_test'",
  );

  if (rows.length === 0) {
    await client.query('CREATE DATABASE helpdesk_test');
    console.log('[global-setup] Created helpdesk_test database.');
  }

  await client.end();
}

function runMigrations() {
  execSync('bunx prisma migrate deploy', {
    cwd: SERVER_DIR,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

function seedDatabase() {
  execSync('bun prisma/seed.ts', {
    cwd: SERVER_DIR,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

export default async function globalSetup() {
  await createTestDatabase();
  runMigrations();
  seedDatabase();
}
