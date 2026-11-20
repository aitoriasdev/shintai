import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './api-client'

afterEach(() => vi.restoreAllMocks())

describe('apiRequest', () => {
  it('builds same-origin URLs, skipping empty params', async () => {
    const fetchMock = vi.spyOn(window, 'fetch').mockResolvedValue(Response.json({ ok: true }))
    await expect(apiRequest('/api/x', { params: { a: 1, b: '', c: null, d: 'y z' } })).resolves.toEqual({ ok: true })
    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.origin).toBe(window.location.origin)
    expect(url.pathname + url.search).toBe('/api/x?a=1&d=y+z')
  })

  it('sends JSON bodies', async () => {
    const fetchMock = vi.spyOn(window, 'fetch').mockResolvedValue(Response.json({}))
    await apiRequest('/api/x', { method: 'PUT', body: { a: 1 } })
    const init = fetchMock.mock.calls[0][1]
    expect(init?.method).toBe('PUT')
    expect(init?.body).toBe('{"a":1}')
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('returns undefined for 204 responses', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    await expect(apiRequest('/api/x', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws ApiError with the server message', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(Response.json({ error: 'Wikipedia is unavailable right now' }, { status: 502 }))
    const error = await apiRequest('/api/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 502, message: 'Wikipedia is unavailable right now' })
  })
})
