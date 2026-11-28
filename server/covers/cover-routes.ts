import { coverQuerySchema } from '@contracts/cover'
import { Hono } from 'hono'
import type { DependencyContainer } from 'tsyringe'
import { parseQuery } from '../http/validation'
import { CoverService } from './cover-service'

export function coverRoutes(container: DependencyContainer) {
  const covers = () => container.resolve(CoverService)

  return new Hono().get('/', async (c) => {
    const image = await covers().resize(parseQuery(c, coverQuerySchema))
    // The same URL always gives the same image, so browsers and CDNs may keep it for a year.
    return c.body(image, 200, { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' })
  })
}
