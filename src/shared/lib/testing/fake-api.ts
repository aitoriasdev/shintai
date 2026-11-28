export type FakeApiHandler = (request: { url: URL; method: string; body: unknown }) => Response | Promise<Response>

/** Routes `window.fetch` calls to `handler`, parsing JSON bodies. Use with `vi.spyOn(window, 'fetch')`. */
export function fakeApi(handler: FakeApiHandler) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin)
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined
    return handler({ url, method: init?.method ?? 'GET', body })
  }
}
