import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } })
}

/**
 * Renders `ui` with the same providers as the app (React Query + Motion), animations disabled.
 * The returned `rerender` keeps the same providers and query client.
 */
export async function renderWithProviders(ui: ReactNode, queryClient = createTestQueryClient()) {
  const withProviders = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="always">{node}</MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  )
  const screen = await render(withProviders(ui))
  const rerender = screen.rerender
  return Object.assign(screen, { queryClient, rerender: (next: ReactNode) => rerender(withProviders(next)) })
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
