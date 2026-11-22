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
import { createOpenApiDocument } from '../openapi/openapi-document'
import { packageVersion } from '../openapi/package-version'
import { LibraryRepository } from '../library/library-repository'
import { TOKENS } from '../tokens'
import { localOnly } from './local-only'
import { blankProblem, ProblemError, problemResponse, typedProblem } from './problem'

export function createApp(container: DependencyContainer) {
  const config = container.resolve<AppConfig>(TOKENS.Config)
  const app = new Hono()

  app.use('/api/*', localOnly())
  app.get('/api/health', (c) => c.json({ status: 'ok' }))
  const openApiDocument = createOpenApiDocument(packageVersion())
  app.get('/api/openapi.json', (c) => c.json(openApiDocument))
  app.route('/api/games', gamesRoutes(container))
  app.route('/api/library', libraryRoutes(container))

  if (config.enableTestRoutes) {
    app.post('/api/__test__/reset', (c) => {
      container.resolve(LibraryRepository).deleteAll()
      return c.body(null, 204)
    })
  }

  app.all('/api/*', (c) => problemResponse(c, blankProblem(404, c.req.path)))

  // Production: serve the built SPA (`yarn start`). In development Vite serves it instead.
  if (existsSync(config.staticRoot)) {
    const root = relative(process.cwd(), config.staticRoot)
    app.use('*', serveStatic({ root }))
    app.get('*', serveStatic({ root, path: 'index.html' }))
  }

  app.onError((error, c) => {
    // Every error body is RFC 9457 Problem Details (application/problem+json).
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
  })

  return app
}
