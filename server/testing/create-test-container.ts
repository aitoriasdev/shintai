import type { DependencyContainer } from 'tsyringe'
import type { AppConfig } from '../config'
import { createContainer } from '../container'
import type { Clock, FetchFn } from '../tokens'

export interface TestClock extends Clock {
  set(ms: number): void
  advance(ms: number): void
}

export function createTestClock(start = Date.UTC(2026, 0, 1)): TestClock {
  let current = start
  return {
    now: () => current,
    set: (ms) => {
      current = ms
    },
    advance: (ms) => {
      current += ms
    },
  }
}

/** Isolated container with an in-memory database, a controllable clock and no real network. */
export function createTestContainer(overrides: { fetch?: FetchFn; config?: Partial<AppConfig> } = {}): {
  container: DependencyContainer
  clock: TestClock
} {
  const clock = createTestClock()
  const fetch: FetchFn = overrides.fetch ?? (() => Promise.reject(new Error('Network is disabled in tests')))
  const container = createContainer(
    {
      host: '127.0.0.1',
      port: 0,
      databasePath: ':memory:',
      staticRoot: '/nonexistent',
      ...overrides.config,
    },
    { clock, fetch },
  )
  return { container, clock }
}
