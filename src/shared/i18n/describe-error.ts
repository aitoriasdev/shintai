import { ApiError, NetworkError } from '@/shared/api/api-client'
import type { Messages } from './messages/en-gb'

/**
 * Turns a failed request into a sentence in the UI language. Known RFC 9457 problem types have their
 * own message; any other API problem falls back to `request`. No answer at all, or an answer that is not
 * a problem (e.g. the dev proxy while the API is down), means the API is unreachable. Anything else is a
 * bug in the UI (an unreadable success body, a throwing `select`): `AppProviders` logs it.
 */
export function describeError(error: Error, t: Messages): string {
  if (error instanceof NetworkError) return t.errors.offline
  if (!(error instanceof ApiError)) return t.errors.unexpected
  if (error.problem === null) return t.errors.offline
  const slug = error.slug
  if (slug && slug in t.errors.problems) return t.errors.problems[slug]
  return t.errors.request(error.status, error.message)
}
