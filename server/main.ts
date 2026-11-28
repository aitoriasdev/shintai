import './reflect-metadata'
import { serve } from '@hono/node-server'
import type { DatabaseSync } from 'node:sqlite'
import { loadConfig } from './config'
import { createContainer } from './container'
import { createApp } from './http/create-app'
import { TOKENS } from './tokens'

const config = loadConfig()
const container = createContainer(config)
const app = createApp(container)

const server = serve({ fetch: app.fetch, hostname: config.host, port: config.port }, ({ port }) => {
  console.log(`Shintai API listening on http://${config.host}:${port} (database: ${config.databasePath})`)
})

function shutdown() {
  server.close(() => {
    container.resolve<DatabaseSync>(TOKENS.Database).close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
