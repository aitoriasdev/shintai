import type { GameSearchPage } from '@contracts/game'
import { PROBLEM_TYPE_BASE } from '@contracts/problem'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../http/create-app'
import { createTestContainer } from '../testing/create-test-container'

function setup(fetchFn?: typeof fetch) {
  return createApp(createTestContainer({ fetch: fetchFn }).container)
}

describe('/api/games', () => {
  it('proxies search to Wikipedia', async () => {
    const fetchFn = vi.fn(async (_input: string | URL | Request) =>
      Response.json({ query: { pages: [{ pageid: 1, title: 'Celeste (video game)', index: 1 }] } }),
    )
    const res = await setup(fetchFn as typeof fetch).request('/api/games/search?q=celeste&year=2018')
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=3600')
    expect(((await res.json()) as GameSearchPage).games[0].title).toBe('Celeste')
    expect(new URL(String(fetchFn.mock.calls[0][0])).searchParams.get('gsrsearch')).toContain('incategory:"2018 video games"')
  })

  it('validates search params', async () => {
    const res = await setup().request('/api/games/search?year=abc')
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({
      type: `${PROBLEM_TYPE_BASE}validation-failed`,
      errors: [{ parameter: 'year', detail: expect.any(String) }],
    })
    expect(res.headers.get('Cache-Control')).toBeNull()
  })

  it('maps upstream failures to 502', async () => {
    const failing = setup((async () => new Response('', { status: 503 })) as typeof fetch)
    const failed = await failing.request('/api/games/search?q=x')
    expect(failed.status).toBe(502)
    // An error must not be cached, or "Try again" would keep failing after Wikipedia recovers.
    expect(failed.headers.get('Cache-Control')).toBeNull()

    const offline = setup((async () => Promise.reject(new TypeError('fetch failed'))) as typeof fetch)
    const res = await offline.request('/api/games/search?q=x')
    expect(res.status).toBe(502)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    // Upstream details stay in the server log.
    expect(await res.json()).toEqual({
      type: `${PROBLEM_TYPE_BASE}upstream-unavailable`,
      status: 502,
      title: 'Wikipedia is unavailable right now',
      instance: '/api/games/search',
    })
  })

  it('validates page ids and maps unknown games to 404', async () => {
    const missing = setup((async () => Response.json({ query: { pages: [{ pageid: 0, title: 'x', missing: true }] } })) as typeof fetch)
    const notFound = await missing.request('/api/games/5/details')
    expect(notFound.status).toBe(404)
    expect(await notFound.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}game-not-found`, detail: 'Game 5 was not found' })
    const invalid = await missing.request('/api/games/abc/details')
    expect(invalid.status).toBe(400)
    expect(await invalid.json()).toMatchObject({ errors: [{ parameter: 'pageId' }] })
  })
})
