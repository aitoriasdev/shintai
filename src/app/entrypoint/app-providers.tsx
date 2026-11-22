import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { ApiError, NetworkError } from '@/shared/api/api-client'

/**
 * The UI shows every failure to the user (see describeError). API and network failures are expected and the API logs its
 * own; anything else is a bug in the UI, so it also goes to the console instead of disappearing.
 */
function logUnexpectedError(error: Error) {
  if (error instanceof ApiError || error instanceof NetworkError) return
  console.error('Unexpected error in a Shintai request.', error)
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: logUnexpectedError }),
  mutationCache: new MutationCache({ onError: logUnexpectedError }),
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, gcTime: 30 * 60 * 1000 },
  },
})

/** React Query + Motion (lazy-loaded DOM animations only; honors the OS "reduce motion" setting). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  )
}
