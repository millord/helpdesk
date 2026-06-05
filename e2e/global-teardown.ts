import { Client } from 'pg';

const TEST_DATABASE_URL =
  'postgresql://postgres:admin123@localhost:5432/helpdesk_test?schema=public';

export default async function globalTeardown() {
  const url = new URL(TEST_DATABASE_URL);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: 'helpdesk_test',
  });

  await client.connect();

  // CASCADE handles FK constraints across all related tables in one shot
  await client.query(
    'TRUNCATE TABLE "verification", "session", "account", "user" CASCADE',
  );

  await client.end();
}
