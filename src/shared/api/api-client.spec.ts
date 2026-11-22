import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemResponse } from '@/shared/lib/testing/fixtures'
import { ApiError, apiRequest, NetworkError } from './api-client'

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

  it('throws ApiError with the RFC 9457 problem', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(problemResponse('entry-not-found', { detail: 'Q1 is not in the library' }))
    const error = await apiRequest('/api/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, slug: 'entry-not-found', message: 'Q1 is not in the library' })
  })

  it('uses the problem title when there is no detail, and has no slug for about:blank', async () => {
    const body = { type: 'about:blank', status: 404, title: 'Not Found' }
    vi.spyOn(window, 'fetch').mockResolvedValue(Response.json(body, { status: 404, headers: { 'Content-Type': 'application/problem+json' } }))
    const error = await apiRequest('/api/x').catch((e: unknown) => e)
    expect(error).toMatchObject({ message: 'Not Found', slug: null, problem: body })
  })

  it('keeps going without a problem when something other than the API answered', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('Bad Gateway', { status: 502, headers: { 'Content-Type': 'text/plain' } }))
    const error = await apiRequest('/api/x').catch((e: unknown) => e)
    expect(error).toMatchObject({ status: 502, problem: null, message: 'Request failed with status 502' })
  })

  it('throws NetworkError, keeping the cause, when the API cannot be reached', async () => {
    const cause = new TypeError('Failed to fetch')
    vi.spyOn(window, 'fetch').mockRejectedValue(cause)
    const error = await apiRequest('/api/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NetworkError)
    expect(error).toMatchObject({ cause })
  })

  it('rethrows the abort as is when the caller cancels the request', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.spyOn(window, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    const error = await apiRequest('/api/x', { signal: controller.signal }).catch((e: unknown) => e)
    expect(error).not.toBeInstanceOf(NetworkError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})
