import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync } from 'node:fs'
import { relative } from 'node:path'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { DependencyContainer } from 'tsyringe'
import type { AppConfig } from '../config'
import { TOKENS } from '../tokens'
import { localOnly } from './local-only'

export function createApp(container: DependencyContainer) {
  const config = container.resolve<AppConfig>(TOKENS.Config)
  const app = new Hono()

  app.use('/api/*', localOnly())
  app.get('/api/health', (c) => c.json({ status: 'ok' }))

  app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

  // Production: serve the built SPA (`yarn start`). In development Vite serves it instead.
  if (existsSync(config.staticRoot)) {
    const root = relative(process.cwd(), config.staticRoot)
    app.use('*', serveStatic({ root }))
    app.get('*', serveStatic({ root, path: 'index.html' }))
  }

  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  })

  return app
}
