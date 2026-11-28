import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { logUnexpectedError } from './log-unexpected-error'

/** The app's single TanStack Query client. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: logUnexpectedError }),
  mutationCache: new MutationCache({ onError: logUnexpectedError }),
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, gcTime: 30 * 60 * 1000 },
  },
})
