import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { Hono } from 'hono'
import type { DependencyContainer } from 'tsyringe'
import type { AppConfig } from '../config'
import { coverRoutes } from '../covers/cover-routes'
import { gamesRoutes } from '../games/games-routes'
import { libraryRoutes } from '../library/library-routes'
import { createOpenApiDocument } from '../openapi/openapi-document'
import { packageVersion } from '../openapi/package-version'
import { LibraryRepository } from '../library/library-repository'
import { TOKENS } from '../tokens'
import { handleError, notFoundProblem } from './handle-error'
import { localOnly } from './local-only'
import { inlineScriptHashes, securityHeaders } from './security-headers'

export function createApp(container: DependencyContainer) {
  const config = container.resolve<AppConfig>(TOKENS.Config)
  const app = new Hono()
  const indexHtml = join(config.staticRoot, 'index.html')
  const scriptHashes = existsSync(indexHtml) ? inlineScriptHashes(readFileSync(indexHtml, 'utf8')) : []

  app.use('*', securityHeaders(scriptHashes))
  app.use('/api/*', localOnly())
  app.get('/api/health', (c) => c.json({ status: 'ok' }))
  const openApiDocument = createOpenApiDocument(packageVersion())
  app.get('/api/openapi.json', (c) => c.json(openApiDocument))
  app.route('/api/covers', coverRoutes(container))
  app.route('/api/games', gamesRoutes(container))
  app.route('/api/library', libraryRoutes(container))

  if (config.enableTestRoutes) {
    app.post('/api/__test__/reset', (c) => {
      container.resolve(LibraryRepository).deleteAll()
      return c.body(null, 204)
    })
  }

  app.all('/api/*', notFoundProblem)

  // Production: serve the built SPA (`yarn start`). In development Vite serves it instead.
  if (existsSync(config.staticRoot)) {
    const root = relative(process.cwd(), config.staticRoot)
    // Built assets have a content hash in their names, so a URL never changes content: cache them for a year.
    // Everything else, index.html above all, is revalidated so a new build is picked up straight away. The HTML
    // fallback for an unknown path (even one under /assets/) is never cached for long.
    app.use('*', async (c, next) => {
      await next()
      if (c.req.path.startsWith('/api/') || !c.res.ok) return
      const isAsset = c.req.path.startsWith('/assets/') && !c.res.headers.get('Content-Type')?.startsWith('text/html')
      c.header('Cache-Control', isAsset ? 'public, max-age=31536000, immutable' : 'no-cache')
    })
    app.use('*', serveStatic({ root }))
    app.get('*', serveStatic({ root, path: 'index.html' }))
  }

  app.onError(handleError)

  return app
}
