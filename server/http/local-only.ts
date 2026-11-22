import type { MiddlewareHandler } from 'hono'
import { problemResponse, typedProblem } from './problem'

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function isLoopbackHost(host: string | undefined): boolean {
  if (!host) return true // HTTP/1.0 or in-process requests: no Host to spoof
  try {
    return LOOPBACK_HOSTNAMES.has(new URL(`http://${host}`).hostname)
  } catch {
    return false
  }
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const url = new URL(origin)
    return (url.protocol === 'http:' || url.protocol === 'https:') && LOOPBACK_HOSTNAMES.has(url.hostname)
  } catch {
    return false
  }
}

/**
 * HTTP/1.1: a request carries a body only if it sends Content-Length or Transfer-Encoding.
 * (Node exposes a body stream for every non-GET request, so `request.body` can't be trusted.)
 */
function hasBody(request: Request): boolean {
  const length = request.headers.get('Content-Length')
  return (length !== null && Number(length) > 0) || request.headers.has('Transfer-Encoding')
}

/**
 * Keeps the API usable only by the local app, even while you browse other sites:
 * - Host must be loopback → blocks DNS-rebinding pages from reading the library.
 * - Writes must come from a loopback Origin (when the browser sends one) and not be cross-site
 *   → blocks CSRF, including `mode: 'no-cors'` "simple" requests that skip CORS preflights.
 * - Write bodies must be `application/json` → `text/plain` simple requests are rejected too.
 */
export function localOnly(): MiddlewareHandler {
  return async (c, next) => {
    if (!isLoopbackHost(c.req.header('Host'))) return problemResponse(c, typedProblem('forbidden-host', c.req.path))

    if (!SAFE_METHODS.has(c.req.method)) {
      const origin = c.req.header('Origin')
      const fetchSite = c.req.header('Sec-Fetch-Site')
      if ((origin && !isLoopbackOrigin(origin)) || fetchSite === 'cross-site') {
        return problemResponse(c, typedProblem('cross-site-request', c.req.path))
      }
      const contentType = c.req.header('Content-Type') ?? ''
      if (hasBody(c.req.raw) && !contentType.startsWith('application/json')) {
        return problemResponse(c, typedProblem('unsupported-media-type', c.req.path))
      }
    }
    await next()
  }
}
