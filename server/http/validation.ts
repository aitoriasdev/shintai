import type { Context } from 'hono'
import type { z } from 'zod'
import { ProblemError } from './problem'

/** RFC 6901: `~` and `/` inside a key are escaped as `~0` and `~1`. */
function jsonPointer(path: PropertyKey[]): string {
  return `#/${path.map((key) => String(key).replaceAll('~', '~0').replaceAll('/', '~1')).join('/')}`
}

function fail(error: z.ZodError, location: 'body' | 'query'): never {
  const errors = error.issues.map((issue) =>
    location === 'body' ? { pointer: jsonPointer(issue.path), detail: issue.message } : { parameter: String(issue.path[0] ?? ''), detail: issue.message },
  )
  const detail = error.issues.map((i) => `${i.path.join('.') || location}: ${i.message}`).join('; ')
  throw new ProblemError('validation-failed', { detail, errors })
}

export async function parseJson<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  const body = await c.req.json().catch((error: unknown) => {
    throw new ProblemError('malformed-json', { cause: error })
  })
  const result = schema.safeParse(body)
  return result.success ? result.data : fail(result.error, 'body')
}

export function parseQuery<T extends z.ZodType>(c: Context, schema: T): z.infer<T> {
  const result = schema.safeParse(c.req.query())
  return result.success ? result.data : fail(result.error, 'query')
}
