import type { GameSummary } from '@contracts/game'
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
    expect((await json('DELETE', '/api/library/Q1')).status).toBe(404)
  })

  it('rejects invalid bodies and mismatched ids', async () => {
    const { app, json } = setup()
    expect((await json('PUT', '/api/library/Q1', { game, patch: { score: 42 } })).status).toBe(400)
    expect((await json('PUT', '/api/library/Q2', { game })).status).toBe(400)
    expect((await app.request('/api/library/Q1', { method: 'PUT', body: '{nope' })).status).toBe(400)
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

  it('test reset route empties the library', async () => {
    const { json } = setup(true)
    await json('PUT', '/api/library/Q1', { game })
    expect((await json('POST', '/api/__test__/reset')).status).toBe(204)
    expect(await (await json('GET', '/api/library')).json()).toEqual([])
  })
})
