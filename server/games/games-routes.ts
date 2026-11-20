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
      c.header('Cache-Control', 'private, max-age=3600')
      return c.json(await catalog().search(parseQuery(c, gameSearchQuerySchema)))
    })
    .get('/:pageId/details', async (c) => {
      const pageId = Number(c.req.param('pageId'))
      if (!Number.isSafeInteger(pageId) || pageId <= 0) throw new HTTPException(400, { message: 'Invalid page id' })
      return c.json(await catalog().getDetails(pageId, c.req.query('qid')))
    })
}
