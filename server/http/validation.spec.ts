import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTestContainer } from '../testing/create-test-container'
import { createApp } from './create-app'
import { ProblemError } from './problem'
import { parseJson } from './validation'

describe('validation problems', () => {
  it('points at each invalid field of the body', async () => {
    const app = createApp(createTestContainer().container)
    const res = await app.request('/api/library/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: 'shintai', version: 1, exportedAt: 0, entries: [{ game: {} }] }),
    })
    const body = (await res.json()) as { errors: Array<{ pointer: string }> }
    expect(body.errors.map((e) => e.pointer)).toContain('#/entries/0/game/id')
  })

  it('escapes "~" and "/" inside keys (RFC 6901)', async () => {
    const app = new Hono().post('/x', async (c) => c.json(await parseJson(c, z.object({ 'a/b~c': z.number() }))))
    app.onError((error) => Response.json(error instanceof ProblemError ? error.errors : String(error)))
    const res = await app.request('/x', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    expect(await res.json()).toMatchObject([{ pointer: '#/a~1b~0c' }])
  })
})
