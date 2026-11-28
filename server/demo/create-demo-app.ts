import { Hono } from 'hono'
import type { DependencyContainer } from 'tsyringe'
import { gamesRoutes } from '../games/games-routes'
import { handleError, notFoundProblem } from '../http/handle-error'
import { securityHeaders } from '../http/security-headers'
import { createOpenApiDocument } from '../openapi/openapi-document'

/**
 * The hosted demo's API: the read-only catalogue. It has no library routes (each visitor's library lives in their
 * browser) and no cover route (Vercel's image optimisation resizes covers), so there is nothing to write and no
 * localhost guard: the demo is meant to be reached from anywhere.
 */
export function createDemoApp(container: DependencyContainer, { version }: { version: string }) {
  const app = new Hono()
  app.use('*', securityHeaders([]))
  app.get('/api/health', (c) => c.json({ status: 'ok' }))
  const openApiDocument = createOpenApiDocument(version)
  app.get('/api/openapi.json', (c) => c.json(openApiDocument))
  app.route('/api/games', gamesRoutes(container))
  app.all('/api/*', notFoundProblem)
  app.onError(handleError)
  return app
}
