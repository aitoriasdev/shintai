import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { z } from 'zod'

function fail(error: z.ZodError): never {
  const message = error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ')
  throw new HTTPException(400, { message })
}

export async function parseJson<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  const body = await c.req.json().catch(() => {
    throw new HTTPException(400, { message: 'Body must be valid JSON' })
  })
  const result = schema.safeParse(body)
  return result.success ? result.data : fail(result.error)
}

export function parseQuery<T extends z.ZodType>(c: Context, schema: T): z.infer<T> {
  const result = schema.safeParse(c.req.query())
  return result.success ? result.data : fail(result.error)
}
