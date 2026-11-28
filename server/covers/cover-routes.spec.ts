import { PROBLEM_CONTENT_TYPE, PROBLEM_TYPE_BASE, type Problem } from '@contracts/problem'
import sharp from 'sharp'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../http/create-app'
import { createTestContainer } from '../testing/create-test-container'

const SRC = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png'
const coverUrl = (src: string, w: number | string) => `/api/covers?src=${encodeURIComponent(src)}&w=${w}`

async function png(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: '#86aba5' } }).png().toBuffer()
}

function setup(upstream: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => upstream(String(input), init))
  const { container } = createTestContainer({ fetch: fetch as typeof globalThis.fetch })
  return { app: createApp(container), fetch }
}

describe('GET /api/covers', () => {
  it('returns the cover resized to the width as WebP, cacheable for a year', async () => {
    const original = await png(600, 800)
    const { app, fetch } = setup(() => new Response(original, { headers: { 'Content-Type': 'image/png' } }))

    const res = await app.request(coverUrl(SRC, 240))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/webp')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    const { format, width, height } = await sharp(new Uint8Array(await res.arrayBuffer())).metadata()
    expect({ format, width, height }).toEqual({ format: 'webp', width: 240, height: 320 })

    // Identifies itself to Wikimedia and refuses redirects, which could lead away from the allowed hosts.
    const [url, init] = fetch.mock.calls[0]
    expect(String(url)).toBe(SRC)
    expect(init?.redirect).toBe('error')
    expect(new Headers(init?.headers).get('User-Agent')).toMatch(/^Shintai\//)
  })

  it('never enlarges a cover smaller than the width', async () => {
    const { app } = setup(async () => new Response(await png(200, 280)))
    const res = await app.request(coverUrl(SRC, 480))
    expect((await sharp(new Uint8Array(await res.arrayBuffer())).metadata()).width).toBe(200)
  })

  it('refuses other hosts without fetching them (no server-side request forgery)', async () => {
    const { app, fetch } = setup(() => new Response('secret'))
    const res = await app.request(coverUrl('http://127.0.0.1:4321/api/library', 240))
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe(PROBLEM_CONTENT_TYPE)
    const problem = (await res.json()) as Problem
    expect(problem.type).toBe(`${PROBLEM_TYPE_BASE}validation-failed`)
    const errors = problem.errors ?? []
    expect(errors.length).toBeGreaterThan(0)
    for (const error of errors) {
      expect(error).toEqual({ parameter: 'src', detail: 'Must be an HTTPS URL on upload.wikimedia.org or thumb.wikimedia.org' })
    }
    expect(fetch).not.toHaveBeenCalled()
  })

  it('refuses widths it does not resize to', async () => {
    const { app } = setup(() => new Response(''))
    const res = await app.request(coverUrl(SRC, 4000))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ errors: [{ parameter: 'w' }] })
  })

  it.each([
    ['Wikimedia answers with an error', () => new Response('Not found', { status: 404 })],
    ['the file is not an image', () => new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } })],
    ['Wikimedia cannot be reached', () => Promise.reject(new TypeError('fetch failed'))],
  ])('answers upstream-unavailable when %s', async (_, upstream) => {
    const { app } = setup(upstream)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const res = await app.request(coverUrl(SRC, 240))
    expect(res.status).toBe(502)
    expect(await res.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}upstream-unavailable` })
    expect(res.headers.get('Cache-Control')).toBeNull()
    warn.mockRestore()
  })
})
