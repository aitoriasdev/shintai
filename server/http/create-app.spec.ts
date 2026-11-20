import type { GameSearchPage, GameSummary } from '@contracts/game'
import { describe, expect, it, vi } from 'vitest'
import { createTestContainer } from '../testing/create-test-container'
import { createApp } from './create-app'

const game: GameSummary = {
  id: 'Q1',
  pageId: 1,
  title: 'Celeste',
  wikiTitle: 'Celeste (video game)',
  description: '2018 video game',
  coverUrl: null,
  year: 2018,
}

function setup(fetchFn?: typeof fetch, enableTestRoutes = false) {
  const { container } = createTestContainer({ fetch: fetchFn, config: { enableTestRoutes } })
  const app = createApp(container)
  const json = (method: string, path: string, body?: unknown) =>
    app.request(path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  return { app, json }
}

describe('/api/library', () => {
  it('supports the full entry lifecycle', async () => {
    const { json } = setup()

    const put = await json('PUT', '/api/library/Q1', { game, patch: { favorite: true, score: 9 } })
    expect(put.status).toBe(200)
    expect(await put.json()).toMatchObject({ game, favorite: true, score: 9, completed: false })

    const list = await (await json('GET', '/api/library')).json()
    expect(list).toHaveLength(1)

    expect((await json('DELETE', '/api/library/Q1')).status).toBe(204)
    expect((await json('DELETE', '/api/library/Q1')).status).toBe(404)
  })

  it('rejects invalid bodies and mismatched ids', async () => {
    const { json } = setup()
    expect((await json('PUT', '/api/library/Q1', { game, patch: { score: 42 } })).status).toBe(400)
    expect((await json('PUT', '/api/library/Q2', { game })).status).toBe(400)
    const malformed = await setup().app.request('/api/library/Q1', { method: 'PUT', body: '{nope' })
    expect(malformed.status).toBe(400)
  })

  it('exports and imports backups', async () => {
    const source = setup()
    await source.json('PUT', '/api/library/Q1', { game })
    const exported = await source.json('GET', '/api/library/backup')
    expect(exported.headers.get('Content-Disposition')).toMatch(/attachment; filename="shintai-backup-\d{4}-\d{2}-\d{2}\.json"/)

    const target = setup()
    const imported = await target.json('POST', '/api/library/backup', await exported.json())
    expect(await imported.json()).toEqual({ added: 1, updated: 0, skipped: 0 })
    expect((await target.json('POST', '/api/library/backup', { app: 'other' })).status).toBe(400)
  })
})

describe('/api/games', () => {
  it('proxies search to Wikipedia', async () => {
    const fetchFn = vi.fn(async (_input: string | URL | Request) => Response.json({ query: { pages: [{ pageid: 1, title: 'Celeste (video game)', index: 1 }] } }))
    const res = await setup(fetchFn as typeof fetch).json('GET', '/api/games/search?q=celeste&year=2018')
    expect(res.status).toBe(200)
    expect(((await res.json()) as GameSearchPage).games[0].title).toBe('Celeste')
    expect(new URL(String(fetchFn.mock.calls[0][0])).searchParams.get('gsrsearch')).toContain('incategory:"2018 video games"')
  })

  it('validates search params', async () => {
    expect((await setup().json('GET', '/api/games/search?year=abc')).status).toBe(400)
  })

  it('maps upstream failures to 502 and unknown games to 404', async () => {
    const failing = setup((async () => new Response('', { status: 503 })) as typeof fetch)
    expect((await failing.json('GET', '/api/games/search?q=x')).status).toBe(502)

    const offline = setup((async () => Promise.reject(new TypeError('fetch failed'))) as typeof fetch)
    const res = await offline.json('GET', '/api/games/search?q=x')
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'Wikipedia is unavailable right now' })

    const missing = setup((async () => Response.json({ query: { pages: [{ pageid: 0, title: 'x', missing: true }] } })) as typeof fetch)
    expect((await missing.json('GET', '/api/games/5/details')).status).toBe(404)
    expect((await missing.json('GET', '/api/games/abc/details')).status).toBe(400)
  })
})

it('responds 404 JSON for unknown API routes', async () => {
  const res = await setup().json('GET', '/api/nope')
  expect(res.status).toBe(404)
  expect(await res.json()).toEqual({ error: 'Not found' })
})

it('only exposes the test reset route when enabled', async () => {
  expect((await setup().json('POST', '/api/__test__/reset')).status).toBe(404)
  const { json } = setup(undefined, true)
  await json('PUT', '/api/library/Q1', { game })
  expect((await json('POST', '/api/__test__/reset')).status).toBe(204)
  expect(await (await json('GET', '/api/library')).json()).toEqual([])
})
