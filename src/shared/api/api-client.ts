import type { Problem, ProblemSlug } from '@contracts/problem'

/** Matches `PROBLEM_TYPE_BASE` in contracts/problem.ts (the UI imports types only from contracts). */
const PROBLEM_TYPE_PREFIX = 'https://github.com/aitoriasdev/shintai/blob/main/docs/api/problems.md#'

export class ApiError extends Error {
  readonly status: number
  /** The RFC 9457 body, or null when something other than the API answered (e.g. the dev proxy with the API down). */
  readonly problem: Problem | null

  constructor(status: number, problem: Problem | null) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }

  /** The Shintai problem type (`validation-failed`, `upstream-unavailable`…), or null for `about:blank` and non-problem answers. */
  get slug(): ProblemSlug | null {
    const type = this.problem?.type
    return type?.startsWith(PROBLEM_TYPE_PREFIX) ? (type.slice(PROBLEM_TYPE_PREFIX.length) as ProblemSlug) : null
  }
}

/** The request never got an answer: the API isn't running, or the network is down. `cause` is fetch's own error. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Could not reach the Shintai API', { cause })
    this.name = 'NetworkError'
  }
}

function isProblem(value: unknown): value is Problem {
  if (typeof value !== 'object' || value === null) return false
  const { type, title, status } = value as Record<string, unknown>
  return typeof type === 'string' && typeof title === 'string' && typeof status === 'number'
}

async function readProblem(res: Response): Promise<Problem | null> {
  if (!res.headers.get('Content-Type')?.includes('json')) return null
  try {
    const body: unknown = await res.json()
    return isProblem(body) ? body : null
  } catch (error) {
    console.warn(`The API sent a ${res.status} error with an unreadable JSON body.`, error)
    return null
  }
}

type Params = Record<string, string | number | null | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Params
  body?: unknown
  signal?: AbortSignal
}

/** Calls the local Shintai API (proxied by Vite in development, same origin in production). */
export async function apiRequest<T>(path: string, { method = 'GET', params, body, signal }: RequestOptions = {}): Promise<T> {
  const url = new URL(path, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    // A cancelled request (TanStack Query aborting a stale search) is not a network failure.
    if (signal?.aborted) throw error
    throw new NetworkError(error)
  }

  if (!res.ok) throw new ApiError(res.status, await readProblem(res))
  return (res.status === 204 ? undefined : await res.json()) as T
}
