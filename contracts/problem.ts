import { z } from 'zod'

/**
 * Error bodies follow RFC 9457 (Problem Details for HTTP APIs), sent as `application/problem+json`.
 * Each Shintai problem type is an absolute URI that resolves to its section in the API docs.
 */
export const PROBLEM_CONTENT_TYPE = 'application/problem+json'

export const PROBLEM_TYPE_BASE = 'https://github.com/aitoriasdev/shintai/blob/main/docs/api/problems.md#'

/** Every problem type the API can send, with its status and its fixed, human-readable title (RFC 9457 §3.1.3). */
export const PROBLEM_TYPES = {
  'validation-failed': { status: 400, title: 'The request is not valid' },
  'malformed-json': { status: 400, title: 'The request body is not valid JSON' },
  'forbidden-host': { status: 403, title: 'The API only answers on this computer' },
  'cross-site-request': { status: 403, title: 'Cross-site requests are not allowed' },
  'game-not-found': { status: 404, title: 'The game was not found' },
  'entry-not-found': { status: 404, title: 'The game is not in the library' },
  'unsupported-media-type': { status: 415, title: 'Request bodies must be application/json' },
  'upstream-unavailable': { status: 502, title: 'Wikipedia is unavailable right now' },
} as const satisfies Record<string, { status: number; title: string }>

export type ProblemSlug = keyof typeof PROBLEM_TYPES

/** One invalid field: `pointer` (RFC 6901 JSON Pointer) for the body, `parameter` for the query string. */
export const problemFieldErrorSchema = z.object({
  detail: z.string(),
  pointer: z.string().optional(),
  parameter: z.string().optional(),
})

export type ProblemFieldError = z.infer<typeof problemFieldErrorSchema>

export const problemSchema = z.object({
  /** A `PROBLEM_TYPE_BASE` URI, or `about:blank` when the status code says it all (unknown route, unexpected error). */
  type: z.string(),
  status: z.number().int().min(400).max(599),
  title: z.string(),
  /** Explanation specific to this occurrence. */
  detail: z.string().optional(),
  /** Path of the request that failed. */
  instance: z.string().optional(),
  /** Extension member for `validation-failed`: every invalid field. */
  errors: z.array(problemFieldErrorSchema).optional(),
})

export type Problem = z.infer<typeof problemSchema>
