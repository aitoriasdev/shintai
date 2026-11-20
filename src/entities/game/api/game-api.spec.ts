import { afterEach, expect, it, vi } from 'vitest'
import { makeGame } from '@/shared/lib/testing/fixtures'
import { fetchGameDetails, searchGames } from './game-api'

afterEach(() => vi.restoreAllMocks())

function lastUrl(mock: ReturnType<typeof vi.spyOn>) {
  const url = new URL(String(mock.mock.calls.at(-1)?.[0]))
  return url.pathname + url.search
}

it('searchGames sends text, year and offset', async () => {
  const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(async () => Response.json({ games: [], nextOffset: null }))
  await searchGames({ text: 'zelda', year: 1998, offset: 24 })
  expect(lastUrl(fetchMock)).toBe('/api/games/search?q=zelda&year=1998&offset=24')
  await searchGames({ text: '', year: null, offset: 0 })
  expect(lastUrl(fetchMock)).toBe('/api/games/search')
})

it('fetchGameDetails passes the Wikidata id only when known', async () => {
  const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(async () => Response.json({}))
  await fetchGameDetails(makeGame({ id: 'Q42', pageId: 7 }))
  expect(lastUrl(fetchMock)).toBe('/api/games/7/details?qid=Q42')
  await fetchGameDetails(makeGame({ id: 'enwiki:7', pageId: 7 }))
  expect(lastUrl(fetchMock)).toBe('/api/games/7/details')
})
