import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * End-to-end flows of the whole app (built frontend + real API + in-memory SQLite).
 * Specs sit next to the slice they cover: `src/**\/*.e2e.ts`.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn build && yarn serve',
    url: `http://127.0.0.1:${PORT}/api/health`,
    env: { SHINTAI_PORT: String(PORT), SHINTAI_DB_PATH: ':memory:' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
