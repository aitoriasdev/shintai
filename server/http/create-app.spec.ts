import { describe, expect, it } from 'vitest'
import { createTestContainer } from '../testing/create-test-container'
import { createApp } from './create-app'

function setup() {
  return createApp(createTestContainer().container)
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
})
