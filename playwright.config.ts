import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/** End-to-end flows of the built app. Specs sit next to the slice they cover: `src/**\/*.e2e.ts`. */
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
    command: `yarn build && yarn preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
