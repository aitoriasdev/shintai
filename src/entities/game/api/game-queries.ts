import type { GameSummary } from '@contracts/game'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { fetchGameDetails, searchGames } from './game-api'

export const gameQueries = {
  search: (text: string, year: number | null) =>
    infiniteQueryOptions({
      queryKey: ['games', 'search', { text, year }] as const,
      queryFn: ({ pageParam, signal }) => searchGames({ text, year, offset: pageParam }, signal),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
      staleTime: 60 * 60 * 1000,
    }),

  details: (game: GameSummary) =>
    queryOptions({
      queryKey: ['games', 'details', game.id] as const,
      queryFn: ({ signal }) => fetchGameDetails(game, signal),
      staleTime: Infinity,
    }),
}
