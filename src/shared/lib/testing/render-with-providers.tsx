import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } })
}

/** Renders `ui` with the same providers as the app (React Query + Motion), animations disabled. */
export async function renderWithProviders(ui: ReactNode, queryClient = createTestQueryClient()) {
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="always">{ui}</MotionConfig>
      </LazyMotion>
    </QueryClientProvider>,
  )
  return Object.assign(screen, { queryClient })
}

type Handler = (request: { url: URL; method: string; body: unknown }) => Response | Promise<Response>

/** Routes `window.fetch` calls to `handler`, parsing JSON bodies. Use with `vi.spyOn(window, 'fetch')`. */
export function fakeApi(handler: Handler) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin)
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined
    return handler({ url, method: init?.method ?? 'GET', body })
  }
}
