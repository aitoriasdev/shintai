import { QueryClient } from '@tanstack/react-query'

/** A query client for tests: no retries, and nothing garbage-collected while a test runs. */
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } })
}
