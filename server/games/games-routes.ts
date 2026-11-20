import { gameSearchQuerySchema } from '@contracts/game'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { DependencyContainer } from 'tsyringe'
import { parseQuery } from '../http/validation'
import { GameCatalogService } from './game-catalog-service'

export function gamesRoutes(container: DependencyContainer) {
  const catalog = () => container.resolve(GameCatalogService)

  return new Hono()
    .get('/search', async (c) => {
      const page = await catalog().search(parseQuery(c, gameSearchQuerySchema))
      // Only successful results may be cached: an error response must never stick in the browser cache.
      return c.json(page, 200, { 'Cache-Control': 'private, max-age=3600' })
    })
    .get('/:pageId/details', async (c) => {
      const pageId = Number(c.req.param('pageId'))
      if (!Number.isSafeInteger(pageId) || pageId <= 0) throw new HTTPException(400, { message: 'Invalid page id' })
      return c.json(await catalog().getDetails(pageId, c.req.query('qid')))
    })
}
