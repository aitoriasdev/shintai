import { QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { loadMotionFeatures } from './load-motion-features'
import { queryClient } from './query-client'

/** React Query + Motion (lazy-loaded DOM animations only; honors the OS "reduce motion" setting). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  )
}
