import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { GameNotFoundError } from '../games/game-catalog-service'
import { UpstreamError } from '../games/wikipedia-client'
import { blankProblem, ProblemError, problemResponse, typedProblem } from './problem'

/** `app.onError`: every error becomes RFC 9457 Problem Details (application/problem+json). */
export function handleError(error: Error, c: Context) {
  const instance = c.req.path
  if (error instanceof ProblemError) return problemResponse(c, typedProblem(error.slug, instance, { detail: error.detail, errors: error.errors }))
  if (error instanceof GameNotFoundError) return problemResponse(c, typedProblem('game-not-found', instance, { detail: error.message }))
  if (error instanceof UpstreamError) {
    // Upstream details go to the server log only.
    console.warn(`${error.message}${error.cause ? ` (${String((error.cause as Error).cause ?? error.cause)})` : ''}`)
    return problemResponse(c, typedProblem('upstream-unavailable', instance))
  }
  if (error instanceof HTTPException) return problemResponse(c, blankProblem(error.status, instance, error.message))
  console.error(error)
  return problemResponse(c, blankProblem(500, instance))
}

/** Unknown `/api` routes: an `about:blank` 404 problem. */
export function notFoundProblem(c: Context) {
  return problemResponse(c, blankProblem(404, c.req.path))
}
