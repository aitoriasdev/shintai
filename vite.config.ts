/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

const API_PORT = Number(process.env.SHINTAI_PORT ?? 4321)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@contracts': fileURLToPath(new URL('./contracts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: { '/api': `http://127.0.0.1:${API_PORT}` },
  },
  test: {
    // Specs live next to the code they cover.
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          include: ['src/**/*.spec.{ts,tsx}'],
          setupFiles: ['./vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          include: ['server/**/*.spec.ts', 'contracts/**/*.spec.ts'],
          environment: 'node',
          setupFiles: ['./server/testing/setup.ts'],
        },
      },
    ],
  },
})
