import { PROBLEM_CONTENT_TYPE, PROBLEM_TYPE_BASE, PROBLEM_TYPES, type Problem, type ProblemFieldError, type ProblemSlug } from '@contracts/problem'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

const STATUS_PHRASES: Record<number, string> = {
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  415: 'Unsupported Media Type',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
}

/** Thrown by routes and validation; `app.onError` turns it into an RFC 9457 response. */
export class ProblemError extends Error {
  readonly slug: ProblemSlug
  readonly detail: string | undefined
  readonly errors: ProblemFieldError[] | undefined

  constructor(slug: ProblemSlug, options: { detail?: string; errors?: ProblemFieldError[]; cause?: unknown } = {}) {
    super(options.detail ?? PROBLEM_TYPES[slug].title, { cause: options.cause })
    this.name = 'ProblemError'
    this.slug = slug
    this.detail = options.detail
    this.errors = options.errors
  }
}

export function typedProblem(slug: ProblemSlug, instance: string, options: { detail?: string; errors?: ProblemFieldError[] } = {}): Problem {
  const { status, title } = PROBLEM_TYPES[slug]
  return { type: PROBLEM_TYPE_BASE + slug, status, title, instance, ...options }
}

/** `about:blank`: no semantics beyond the status code, so the title is the status phrase (RFC 9457 §4.2.1). */
export function blankProblem(status: number, instance: string, detail?: string): Problem {
  return { type: 'about:blank', status, title: STATUS_PHRASES[status] ?? 'Error', instance, ...(detail ? { detail } : {}) }
}

export function problemResponse(c: Context, problem: Problem) {
  return c.body(JSON.stringify(problem), problem.status as ContentfulStatusCode, { 'Content-Type': PROBLEM_CONTENT_TYPE })
}
