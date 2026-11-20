import type { GameSummary } from '@contracts/game'
import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchX, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { YearSelect } from '@/features/search-games/ui/year-select'
import { announce } from '@/shared/lib/announce'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { EmptyState } from '@/shared/ui/empty-state'
import { GameGrid } from './game-grid'
import { GameGridSkeleton } from './game-grid-skeleton'

interface DiscoverPageProps {
  /** Debounced search text from the header. */
  query: string
  onOpen: (game: GameSummary) => void
}

export function DiscoverPage({ query, onOpen }: DiscoverPageProps) {
  const [year, setYear] = useState<number | null>(null)
  const text = query.trim()
  const search = useInfiniteQuery(gameQueries.search(text, year))

  // Wikipedia pagination can repeat a page across offsets: keep the first occurrence.
  const games = useMemo(() => {
    const seen = new Set<string>()
    return (search.data?.pages ?? []).flatMap((page) => page.games).filter((game) => !seen.has(game.id) && !!seen.add(game.id))
  }, [search.data])

  const heading = text ? `Results for “${text}”` : year ? `Notable games of ${year}` : 'Notable games'
  useDocumentTitle(text ? heading : 'Discover')

  // 4.1.3: tell screen reader users how a new search or filter turned out.
  const firstPage = search.data?.pages[0]
  useEffect(() => {
    if (!firstPage) return
    const count = firstPage.games.length
    announce(count === 0 ? 'No games found' : `${heading}: ${count}${firstPage.nextOffset ? ' or more' : ''} games`)
  }, [firstPage, heading])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 tabIndex={-1} className="text-2xl font-bold text-text focus:outline-none">
            {heading}
          </h1>
          <p className="text-sm text-muted">Tens of thousands of games from Wikipedia. Tap a game to rate it.</p>
        </div>
        <YearSelect value={year} onChange={setYear} />
      </div>

      {search.isPending ? (
        <GameGridSkeleton label="Loading games" />
      ) : search.isError && !search.data ? (
        <EmptyState icon={<WifiOff className="size-6" />} title="Could not load games">
          <p role="alert">{search.error.message}</p>
          <button type="button" className="mt-3 min-h-11 font-medium text-accent hover:underline" onClick={() => search.refetch()}>
            Try again
          </button>
        </EmptyState>
      ) : games.length === 0 ? (
        <EmptyState icon={<SearchX className="size-6" />} title="No games found">
          Try a different spelling{year ? ' or another year' : ''}.
        </EmptyState>
      ) : (
        <>
          <GameGrid
            label="Games"
            games={games}
            onOpen={onOpen}
            // After a failed page, stop auto-loading (it would retry in a loop) and offer an explicit retry.
            hasMore={search.hasNextPage && !search.isFetchNextPageError}
            isLoadingMore={search.isFetchingNextPage}
            onLoadMore={search.fetchNextPage}
          />
          {search.isFetchNextPageError && (
            <div role="alert" className="flex flex-wrap items-center justify-center gap-3 pt-8 text-sm text-text">
              <p>Could not load more games: {search.error?.message}</p>
              <button
                type="button"
                disabled={search.isFetchingNextPage}
                onClick={() => search.fetchNextPage()}
                className="h-11 rounded-full border border-control bg-surface px-5 font-medium hover:bg-surface-2 disabled:opacity-50"
              >
                {search.isFetchingNextPage ? 'Retrying…' : 'Try again'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
