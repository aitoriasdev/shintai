import { resolve } from 'node:path'

export interface AppConfig {
  /** Interface the HTTP server binds to. Loopback only: the app is never exposed to the network. */
  host: string
  port: number
  /** SQLite file path, or `:memory:`. */
  databasePath: string
  /** Built frontend served by the API in production (`yarn start`). */
  staticRoot: string
  /** How long cached game details stay fresh. */
  detailsTtlMs: number
  /** Exposes `/api/__test__/*` helpers. Only enabled by the E2E suite. */
  enableTestRoutes: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    host: '127.0.0.1',
    port: Number(env.SHINTAI_PORT ?? 4321),
    databasePath: env.SHINTAI_DB_PATH ?? resolve('data', 'shintai.db'),
    staticRoot: resolve('dist'),
    detailsTtlMs: 30 * DAY_MS,
    enableTestRoutes: env.SHINTAI_TEST_ROUTES === '1',
  }
}
