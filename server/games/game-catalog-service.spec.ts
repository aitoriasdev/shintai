import { describe, expect, it, vi } from 'vitest'
import { createTestContainer } from '../testing/create-test-container'
import { GameCatalogService, GameNotFoundError } from './game-catalog-service'

const article = {
  query: { pages: [{ pageid: 10, title: 'Celeste (video game)', extract: 'Intro.', fullurl: 'https://en.wikipedia.org/wiki/Celeste' }] },
}
const facts = { results: { bindings: [{ kind: { value: 'platform' }, valueLabel: { value: 'PC' } }] } }

function setup(handler: (url: URL) => Response | Promise<Response>) {
  const fetchFn = vi.fn(async (input: string | URL | Request) => handler(new URL(String(input))))
  const { container, clock } = createTestContainer({ fetch: fetchFn as typeof fetch })
  return { service: container.resolve(GameCatalogService), fetchFn, clock }
}

describe('GameCatalogService.getDetails', () => {
  it('merges the article with Wikidata facts and caches the result', async () => {
    const { service, fetchFn } = setup((url) => Response.json(url.hostname.includes('wikidata') ? facts : article))

    const details = await service.getDetails(10, 'Q1')
    expect(details).toEqual({
      extract: 'Intro.',
      coverUrl: null,
      wikipediaUrl: 'https://en.wikipedia.org/wiki/Celeste',
      releaseDate: null,
      platforms: ['PC'],
      genres: [],
      developers: [],
      publishers: [],
    })

    await service.getDetails(10, 'Q1')
    expect(fetchFn).toHaveBeenCalledTimes(2) // second call served from SQLite
  })

  it('refetches once the cache entry is stale', async () => {
    const { service, fetchFn, clock } = setup((url) => Response.json(url.hostname.includes('wikidata') ? facts : article))
    await service.getDetails(10, 'Q1')
    clock.advance(31 * 24 * 60 * 60 * 1000)
    await service.getDetails(10, 'Q1')
    expect(fetchFn).toHaveBeenCalledTimes(4)
  })

  it('still resolves without caching when Wikidata fails', async () => {
    const { service, fetchFn } = setup((url) => (url.hostname.includes('wikidata') ? new Response('', { status: 500 }) : Response.json(article)))
    const details = await service.getDetails(10, 'Q1')
    expect(details.extract).toBe('Intro.')
    expect(details.platforms).toEqual([])
    await service.getDetails(10, 'Q1')
    expect(fetchFn).toHaveBeenCalledTimes(6) // article + Wikidata (retried once), twice: partial results are not cached
  })

  it('skips Wikidata without a valid Q-id', async () => {
    const { service, fetchFn } = setup(() => Response.json(article))
    await service.getDetails(10, 'not-a-qid')
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('throws GameNotFoundError for missing articles', async () => {
    const { service } = setup(() => Response.json({ query: { pages: [{ pageid: 0, title: 'x', missing: true }] } }))
    await expect(service.getDetails(999)).rejects.toBeInstanceOf(GameNotFoundError)
  })
})
