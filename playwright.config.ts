import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * End-to-end flows of the whole app (built frontend + real API + in-memory SQLite).
 * Specs sit next to the slice they cover: `src/**\/*.e2e.ts`.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  // All tests share one API process and database, which is reset before each test.
  workers: 1,
  // A stray `test.only` would silently skip the rest of the suite in CI.
  forbidOnly: Boolean(process.env.CI),
  // On GitHub Actions, failures are also annotated on the pull request's diff.
  reporter: process.env.GITHUB_ACTIONS ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn build && yarn serve',
    url: `http://127.0.0.1:${PORT}/api/health`,
    env: { SHINTAI_PORT: String(PORT), SHINTAI_DB_PATH: ':memory:', SHINTAI_TEST_ROUTES: '1' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
