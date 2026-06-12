import { test, expect, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@example.com', password: 'admin123', name: 'Admin' };
const AGENT = { email: 'agent@example.com', password: 'admin123', name: 'Agent' };

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

// ---------------------------------------------------------------------------
// Login — happy paths
// ---------------------------------------------------------------------------
test.describe('Login — happy path', () => {
  test('admin can log in and sees the Dashboard with Users nav link', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(ADMIN.name)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  });

  test('agent can log in and sees the Dashboard without Users nav link', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(AGENT.email);
    await page.getByLabel('Password').fill(AGENT.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(AGENT.name)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login — error states
// ---------------------------------------------------------------------------
test.describe('Login — error states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows server error for wrong password', async ({ page }) => {
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('shows server error for unknown email', async ({ page }) => {
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('shows client-side validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('somepassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('shows client-side validation error for empty password', async ({ page }) => {
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('shows both validation errors when form is submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// Login — button loading state during submission
// ---------------------------------------------------------------------------
test.describe('Login — button state during submission', () => {
  test('button is disabled and shows "Signing in…" while request is in flight', async ({ page }) => {
    // Delay the auth request so we can observe the transitional button state.
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('button', { name: 'Signing in…' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled();

    await expect(page).toHaveURL('/');
  });
});

// ---------------------------------------------------------------------------
// Already-authenticated redirect
// ---------------------------------------------------------------------------
test.describe('Already-authenticated redirect', () => {
  test('visiting /login while authenticated redirects to /', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------
test.describe('ProtectedRoute', () => {
  test('unauthenticated user visiting / is redirected to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('authenticated user visiting / sees the Dashboard', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AdminRoute
// ---------------------------------------------------------------------------
test.describe('AdminRoute', () => {
  test('unauthenticated user visiting /users is redirected to /login', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL('/login');
  });

  test('agent visiting /users is redirected to / (not /login)', async ({ page }) => {
    await login(page, AGENT.email, AGENT.password);
    await page.goto('/users');
    await expect(page).toHaveURL('/');
  });

  test('admin visiting /users sees the Users page', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/users');
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
test.describe('Sign out', () => {
  test('clicking Sign out redirects to /login and session is cleared', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/login');

    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// Nav — Users link visibility (role-conditional UI)
// ---------------------------------------------------------------------------
test.describe('Nav — Users link visibility', () => {
  test('admin sees the Users link in the nav bar', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  });

  test('agent does not see the Users link in the nav bar', async ({ page }) => {
    await login(page, AGENT.email, AGENT.password);
    await expect(page.getByRole('link', { name: 'Users' })).not.toBeVisible();
  });
});
