import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync } from 'node:fs'
import { relative } from 'node:path'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { DependencyContainer } from 'tsyringe'
import type { AppConfig } from '../config'
import { GameNotFoundError } from '../games/game-catalog-service'
import { gamesRoutes } from '../games/games-routes'
import { UpstreamError } from '../games/wikipedia-client'
import { libraryRoutes } from '../library/library-routes'
import { LibraryRepository } from '../library/library-repository'
import { TOKENS } from '../tokens'

export function createApp(container: DependencyContainer) {
  const config = container.resolve<AppConfig>(TOKENS.Config)
  const app = new Hono()

  app.get('/api/health', (c) => c.json({ status: 'ok' }))
  app.route('/api/games', gamesRoutes(container))
  app.route('/api/library', libraryRoutes(container))

  if (config.enableTestRoutes) {
    app.post('/api/__test__/reset', (c) => {
      container.resolve(LibraryRepository).deleteAll()
      return c.body(null, 204)
    })
  }

  app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

  // Production: serve the built SPA (`yarn start`). In development Vite serves it instead.
  if (existsSync(config.staticRoot)) {
    const root = relative(process.cwd(), config.staticRoot)
    app.use('*', serveStatic({ root }))
    app.get('*', serveStatic({ root, path: 'index.html' }))
  }

  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
    if (error instanceof GameNotFoundError) return c.json({ error: error.message }, 404)
    if (error instanceof UpstreamError) {
      console.warn(`${error.message}${error.cause ? ` (${String((error.cause as Error).cause ?? error.cause)})` : ''}`)
      return c.json({ error: 'Wikipedia is unavailable right now' }, 502)
    }
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  })

  return app
}
