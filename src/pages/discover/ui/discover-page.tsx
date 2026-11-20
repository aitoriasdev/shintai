import type { GameSummary } from '@contracts/game'
import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchX, WifiOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { YearSelect } from '@/features/search-games/ui/year-select'
import { GameGrid } from '@/widgets/game-grid/ui/game-grid'
import { GameGridSkeleton } from '@/widgets/game-grid/ui/game-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">{heading}</h1>
          <p className="text-sm text-muted">Tens of thousands of games from Wikipedia. Tap a game to rate it.</p>
        </div>
        <YearSelect value={year} onChange={setYear} />
      </div>

      {search.isPending ? (
        <GameGridSkeleton />
      ) : search.isError ? (
        <EmptyState icon={<WifiOff className="size-6" />} title="Could not load games">
          <p>{search.error.message}</p>
          <button type="button" className="mt-3 font-medium text-accent hover:underline" onClick={() => search.refetch()}>
            Try again
          </button>
        </EmptyState>
      ) : games.length === 0 ? (
        <EmptyState icon={<SearchX className="size-6" />} title="No games found">
          Try a different spelling{year ? ' or another year' : ''}.
        </EmptyState>
      ) : (
        <GameGrid
          label="Games"
          games={games}
          onOpen={onOpen}
          hasMore={search.hasNextPage}
          isLoadingMore={search.isFetchingNextPage}
          onLoadMore={search.fetchNextPage}
        />
      )}
    </div>
  )
}
