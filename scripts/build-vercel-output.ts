/**
 * `yarn build:vercel`, after `VITE_DEMO=true yarn build`: writes the hosted demo in Vercel's Build Output API format
 * (https://vercel.com/docs/build-output-api/v3), which Vercel deploys as is:
 * - static/: the built app (dist/)
 * - functions/api.func/: the catalogue API, bundled with esbuild (Vercel's own TypeScript build doesn't resolve
 *   tsconfig path aliases)
 * - config.json: routes, the same security headers as the local server, caching and image optimisation for covers
 */
import { build } from 'esbuild'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { Hono } from 'hono'
import { COVER_HOSTS, COVER_WIDTHS } from '../contracts/cover'
import { inlineScriptHashes, securityHeaders } from '../server/http/security-headers'
import { packageVersion } from '../server/openapi/package-version'

const OUTPUT = '.vercel/output'
const FUNCTION_DIR = `${OUTPUT}/functions/api.func`

/** The headers the local server sends, taken from the same middleware so both deployments stay in sync. */
async function staticSecurityHeaders(indexHtml: string): Promise<Record<string, string>> {
  const app = new Hono().use('*', securityHeaders(inlineScriptHashes(indexHtml))).get('/', (c) => c.body(null))
  const res = await app.request('/')
  return Object.fromEntries(res.headers)
}

rmSync(OUTPUT, { recursive: true, force: true })
cpSync('dist', `${OUTPUT}/static`, { recursive: true })

mkdirSync(FUNCTION_DIR, { recursive: true })
await build({
  entryPoints: ['server/demo/vercel-handler.ts'],
  outfile: `${FUNCTION_DIR}/index.mjs`,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  tsconfig: 'tsconfig.server.json',
  // Some bundled CommonJS dependencies call require().
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  define: { 'process.env.SHINTAI_VERSION': JSON.stringify(packageVersion()) },
  legalComments: 'none',
  logLevel: 'warning',
})
writeFileSync(
  `${FUNCTION_DIR}/.vc-config.json`,
  JSON.stringify({ runtime: 'nodejs24.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false }, null, 2),
)

const headers = await staticSecurityHeaders(readFileSync('dist/index.html', 'utf8'))
const config = {
  version: 3,
  routes: [
    { src: '/(.*)', headers, continue: true },
    // Built assets have content-hashed names; everything else is revalidated.
    { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    { src: '/api/(.*)', dest: '/api' },
    { handle: 'filesystem' },
  ],
  // Covers: /_vercel/image?url=…&w=… resizes Wikimedia's originals (see coverSrc in the UI).
  images: {
    sizes: [...COVER_WIDTHS],
    domains: [...COVER_HOSTS],
    formats: ['image/webp'],
    minimumCacheTTL: 31_536_000,
  },
}
writeFileSync(`${OUTPUT}/config.json`, JSON.stringify(config, null, 2))
console.log(`Wrote ${OUTPUT}: static app, the /api function and config.json`)
