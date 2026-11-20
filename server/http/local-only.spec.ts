import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { localOnly } from './local-only'

const app = new Hono()
  .use('/api/*', localOnly())
  .get('/api/data', (c) => c.json({ ok: true }))
  .post('/api/data', (c) => c.json({ ok: true }))
  .delete('/api/data', (c) => c.body(null, 204))

/** Like a browser: requests with a body carry Content-Length. */
const request = (method: string, headers: Record<string, string>, body?: string) =>
  app.request('http://127.0.0.1:4321/api/data', {
    method,
    headers: body ? { 'Content-Length': String(body.length), ...headers } : headers,
    body,
  })

describe('localOnly', () => {
  it.each(['127.0.0.1:4321', 'localhost:5173', '[::1]:4321'])('allows loopback Host %s', async (host) => {
    expect((await request('GET', { Host: host })).status).toBe(200)
  })

  it('rejects other Hosts (DNS rebinding)', async () => {
    expect((await request('GET', { Host: 'evil.example:4321' })).status).toBe(403)
  })

  it('allows same-origin JSON writes, including from the Vite dev server', async () => {
    const headers = { Host: '127.0.0.1:4321', 'Content-Type': 'application/json' }
    expect((await request('POST', { ...headers, Origin: 'http://127.0.0.1:4321' }, '{}')).status).toBe(200)
    expect((await request('POST', { ...headers, Origin: 'http://localhost:5173' }, '{}')).status).toBe(200)
    expect((await request('POST', headers, '{}')).status).toBe(200)
  })

  it('rejects cross-site writes (CSRF)', async () => {
    const headers = { Host: '127.0.0.1:4321', 'Content-Type': 'application/json' }
    expect((await request('POST', { ...headers, Origin: 'https://evil.example' }, '{}')).status).toBe(403)
    expect((await request('POST', { ...headers, Origin: 'null' }, '{}')).status).toBe(403)
    expect((await request('POST', { ...headers, 'Sec-Fetch-Site': 'cross-site' }, '{}')).status).toBe(403)
  })

  it('allows body-less writes such as an empty POST or a DELETE', async () => {
    expect((await request('POST', { Host: '127.0.0.1:4321', 'Content-Length': '0' })).status).toBe(200)
    expect((await request('DELETE', { Host: '127.0.0.1:4321', Origin: 'http://127.0.0.1:4321' })).status).toBe(204)
  })

  it('rejects non-JSON bodies, which browsers send cross-site without a preflight', async () => {
    const res = await request('POST', { Host: '127.0.0.1:4321', 'Content-Type': 'text/plain;charset=UTF-8' }, '{}')
    expect(res.status).toBe(415)
  })
})
