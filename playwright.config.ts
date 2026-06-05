import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, 'server', '.env') });

const TEST_DATABASE_URL =
  'postgresql://postgres:admin123@localhost:5432/helpdesk_test?schema=public';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'bun run --filter @helpdesk/server dev',
      url: 'http://localhost:3000/api/auth/get-session',
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
      },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'bun run --filter @helpdesk/client dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
