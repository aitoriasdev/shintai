import { describe, expect, it } from 'vitest'
import { createTestContainer } from '../testing/create-test-container'
import { createApp } from './create-app'

function setup(enableTestRoutes = false) {
  const { container } = createTestContainer({ config: { enableTestRoutes } })
  return createApp(container)
}

describe('createApp', () => {
  it('reports health', async () => {
    const res = await setup().request('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('responds 404 JSON for unknown API routes', async () => {
    const res = await setup().request('/api/nope')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })

  it('only exposes the test reset route when enabled', async () => {
    expect((await setup().request('/api/__test__/reset', { method: 'POST' })).status).toBe(404)
    expect((await setup(true).request('/api/__test__/reset', { method: 'POST' })).status).toBe(204)
  })
})
