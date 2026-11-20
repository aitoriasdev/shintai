import type { GameDetails, GameSearchPage, GameSummary } from '@contracts/game'
import { apiRequest } from '@/shared/api/api-client'

export function searchGames(params: { text: string; year: number | null; offset: number }, signal?: AbortSignal) {
  return apiRequest<GameSearchPage>('/api/games/search', {
    params: { q: params.text, year: params.year, offset: params.offset || null },
    signal,
  })
}

export function fetchGameDetails(game: GameSummary, signal?: AbortSignal) {
  return apiRequest<GameDetails>(`/api/games/${game.pageId}/details`, {
    params: { qid: game.id.startsWith('Q') ? game.id : null },
    signal,
  })
}
