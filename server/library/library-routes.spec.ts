import type { GameSummary } from '@contracts/game'
import { PROBLEM_TYPE_BASE } from '@contracts/problem'
import { describe, expect, it } from 'vitest'
import { createApp } from '../http/create-app'
import { createTestContainer } from '../testing/create-test-container'

const game: GameSummary = {
  id: 'Q1',
  pageId: 1,
  title: 'Celeste',
  wikiTitle: 'Celeste (video game)',
  description: '2018 video game',
  coverUrl: null,
  year: 2018,
}

function setup(enableTestRoutes = false) {
  const app = createApp(createTestContainer({ config: { enableTestRoutes } }).container)
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
    expect(await (await json('GET', '/api/library')).json()).toHaveLength(1)

    expect((await json('DELETE', '/api/library/Q1')).status).toBe(204)
    const gone = await json('DELETE', '/api/library/Q1')
    expect(gone.status).toBe(404)
    expect(await gone.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}entry-not-found`, instance: '/api/library/Q1' })
  })

  it('rejects invalid bodies and mismatched ids', async () => {
    const { app, json } = setup()
    const invalid = await json('PUT', '/api/library/Q1', { game, patch: { score: 42 } })
    expect(invalid.status).toBe(400)
    expect(invalid.headers.get('Content-Type')).toBe('application/problem+json')
    expect(await invalid.json()).toMatchObject({
      type: `${PROBLEM_TYPE_BASE}validation-failed`,
      errors: [{ pointer: '#/patch/score', detail: expect.any(String) }],
    })

    const mismatched = await json('PUT', '/api/library/Q2', { game })
    expect(await mismatched.json()).toMatchObject({ status: 400, errors: [{ pointer: '#/game/id' }] })

    const malformed = await app.request('/api/library/Q1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{nope' })
    expect(malformed.status).toBe(400)
    expect(await malformed.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}malformed-json` })
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

  it('rejects cross-site backup imports (CSRF), leaving the library untouched', async () => {
    const { app, json } = setup()
    await json('PUT', '/api/library/Q1', { game, patch: { score: 9 } })
    const forged = JSON.stringify({
      app: 'shintai',
      version: 1,
      exportedAt: 0,
      entries: [{ game, score: 1, completed: false, favorite: false, addedAt: 0, updatedAt: 9e15 }],
    })

    // fetch(url, { method: 'POST', mode: 'no-cors', body }) from another site: text/plain, no preflight.
    const noCors = await app.request('/api/library/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'Content-Length': String(forged.length) },
      body: forged,
    })
    expect(noCors.status).toBe(415)
    expect(await noCors.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}unsupported-media-type` })
    const crossOrigin = await app.request('/api/library/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
      body: forged,
    })
    expect(crossOrigin.status).toBe(403)
    expect(await crossOrigin.json()).toMatchObject({ type: `${PROBLEM_TYPE_BASE}cross-site-request` })

    expect(await (await json('GET', '/api/library')).json()).toMatchObject([{ score: 9 }])
  })

  it('test reset route empties the library', async () => {
    const { json } = setup(true)
    await json('PUT', '/api/library/Q1', { game })
    expect((await json('POST', '/api/__test__/reset')).status).toBe(204)
    expect(await (await json('GET', '/api/library')).json()).toEqual([])
  })
})
