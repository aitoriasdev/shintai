import { PROBLEM_CONTENT_TYPE } from '@contracts/problem'
import { describe, expect, it, vi } from 'vitest'
import { createDemoApp } from './create-demo-app'
import { createDemoContainer } from './create-demo-container'

const PUBLIC_HOST = { Host: 'shintai.vercel.app' }

function setup(fetchFn: typeof fetch = vi.fn()) {
  return createDemoApp(createDemoContainer({ fetch: fetchFn }), { version: '1.2.3' })
}

describe('the hosted demo API', () => {
  it('answers on a public host name (it has no localhost guard)', async () => {
    const res = await setup().request('/api/health', { headers: PUBLIC_HOST })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'none'")
  })

  it('describes itself with the version it was built from', async () => {
    const res = await setup().request('/api/openapi.json', { headers: PUBLIC_HOST })
    expect(((await res.json()) as { info: { version: string } }).info.version).toBe('1.2.3')
  })

  it('serves the catalogue from Wikipedia', async () => {
    const fetchFn = vi.fn(async () => Response.json({ query: { pages: [] } }))
    const res = await setup(fetchFn as typeof fetch).request('/api/games/search?q=celeste', { headers: PUBLIC_HOST })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ games: [], nextOffset: null })
    expect(fetchFn).toHaveBeenCalled()
  })

  it.each([
    ['GET', '/api/library'],
    ['PUT', '/api/library/Q17185964'],
    ['POST', '/api/library/backup'],
    ['GET', '/api/covers?src=https%3A%2F%2Fupload.wikimedia.org%2Fx.png&w=240'],
    ['POST', '/api/games/search'],
  ])('has no %s %s: libraries live in the browser and Vercel resizes covers', async (method, path) => {
    const res = await setup().request(path, { method, headers: PUBLIC_HOST })
    expect(res.status).toBe(404)
    expect(res.headers.get('Content-Type')).toBe(PROBLEM_CONTENT_TYPE)
  })
})
