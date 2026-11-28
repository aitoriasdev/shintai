// Entry point of the Vercel function (bundled by scripts/build-vercel-output.ts). tsyringe needs Reflect metadata first.
import 'reflect-metadata'
import { getRequestListener } from '@hono/node-server'
import { createDemoApp } from './create-demo-app'
import { createDemoContainer } from './create-demo-container'

// The bundle has no package.json to read, so the build script injects the version (esbuild `define`).
const app = createDemoApp(createDemoContainer(), { version: process.env.SHINTAI_VERSION ?? 'unknown' })

/** Node.js `(req, res)` handler, as Vercel's Node runtime expects. */
export default getRequestListener(app.fetch)
