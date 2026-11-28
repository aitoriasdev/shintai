import { ApiError, NetworkError } from '@/shared/api/api-client'

/**
 * The UI shows every failure to the user (see describeError). API and network failures are expected and the API logs its
 * own; anything else is a bug in the UI, so it also goes to the console instead of disappearing.
 */
export function logUnexpectedError(error: Error) {
  if (error instanceof ApiError || error instanceof NetworkError) return
  console.error('Unexpected error in a Shintai request.', error)
}
