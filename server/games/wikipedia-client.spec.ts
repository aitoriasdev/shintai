import { describe, expect, it, vi } from 'vitest'
import { buildSearchQuery, UpstreamError, WikipediaClient } from './wikipedia-client'

function clientWith(handler: (url: URL) => Response) {
  const fetchFn = vi.fn(async (input: string | URL | Request) => handler(new URL(String(input))))
  return { client: new WikipediaClient(fetchFn as typeof fetch), fetchFn }
}

describe('buildSearchQuery', () => {
  it('restricts to game articles and strips syntax-breaking characters', () => {
    expect(buildSearchQuery('  "zelda"\\ ')).toBe('zelda hastemplate:"Infobox video game"')
  })

  it('browses everything when text is empty and filters by year category', () => {
    expect(buildSearchQuery('', 1998)).toBe('hastemplate:"Infobox video game" incategory:"1998 video games"')
  })
})

describe('WikipediaClient', () => {
  it('searchGames maps ranked pages and exposes the next offset', async () => {
    const { client, fetchFn } = clientWith(() =>
      Response.json({
        continue: { gsroffset: 24 },
        query: {
          pages: [
            { pageid: 2, title: 'B', index: 2 },
            { pageid: 1, title: 'A', index: 1, pageprops: { wikibase_item: 'Q9' } },
          ],
        },
      }),
    )

    const page = await client.searchGames({ text: 'a', offset: 0 })

    expect(page.games.map((g) => g.id)).toEqual(['Q9', 'enwiki:2'])
    expect(page.nextOffset).toBe(24)
    const url = new URL(String(fetchFn.mock.calls[0][0]))
    expect(url.searchParams.get('gsrsearch')).toBe('a hastemplate:"Infobox video game"')
    expect(url.searchParams.has('gsroffset')).toBe(false)
  })

  it('searchGames handles empty results', async () => {
    const { client } = clientWith(() => Response.json({ batchcomplete: true }))
    await expect(client.searchGames({ text: 'zzzz' })).resolves.toEqual({ games: [], nextOffset: null })
  })

  it('getArticle returns null for missing pages', async () => {
    const { client } = clientWith(() => Response.json({ query: { pages: [{ pageid: 0, title: 'x', missing: true }] } }))
    await expect(client.getArticle(123)).resolves.toBeNull()
  })

  it('getFacts queries Wikidata for the given item', async () => {
    const { client, fetchFn } = clientWith(() =>
      Response.json({ results: { bindings: [{ kind: { value: 'platform' }, valueLabel: { value: 'PC' } }] } }),
    )
    const facts = await client.getFacts('Q42')
    expect(facts.platforms).toEqual(['PC'])
    expect(new URL(String(fetchFn.mock.calls[0][0])).searchParams.get('query')).toContain('wd:Q42 ?prop ?value')
  })

  it('wraps network failures in UpstreamError', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    const error = await new WikipediaClient(fetchFn as typeof fetch).searchGames({ text: 'a' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(UpstreamError)
    expect(error).toMatchObject({ status: null })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('throws UpstreamError after retrying transient failures once', async () => {
    const { client, fetchFn } = clientWith(() => new Response('busy', { status: 503 }))
    await expect(client.searchGames({ text: 'a' })).rejects.toBeInstanceOf(UpstreamError)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('recovers when the retry succeeds', async () => {
    let calls = 0
    const { client } = clientWith(() => (++calls === 1 ? new Response('', { status: 429 }) : Response.json({ batchcomplete: true })))
    await expect(client.searchGames({ text: 'a' })).resolves.toEqual({ games: [], nextOffset: null })
  })

  it('does not retry client errors', async () => {
    const { client, fetchFn } = clientWith(() => new Response('bad', { status: 400 }))
    await expect(client.searchGames({ text: 'a' })).rejects.toMatchObject({ status: 400 })
    expect(fetchFn).toHaveBeenCalledOnce()
  })
})
