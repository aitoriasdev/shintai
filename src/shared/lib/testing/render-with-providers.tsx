import { QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { createTestQueryClient } from './create-test-query-client'

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
