import type { GameSummary } from '@contracts/game'
import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchX, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { YearSelect } from '@/features/search-games/ui/year-select'
import { describeError } from '@/shared/i18n/describe-error'
import { useI18n } from '@/shared/i18n/use-i18n'
import { announce } from '@/shared/lib/announce'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { EmptyState } from '@/shared/ui/empty-state'
import { GameGrid } from '@/widgets/game-grid/ui/game-grid'
import { GameGridSkeleton } from '@/widgets/game-grid/ui/game-grid-skeleton'

interface DiscoverPageProps {
  /** Debounced search text from the header. */
  query: string
  onOpen: (game: GameSummary) => void
}

export function DiscoverPage({ query, onOpen }: DiscoverPageProps) {
  const { t } = useI18n()
  const [year, setYear] = useState<number | null>(null)
  const text = query.trim()
  const search = useInfiniteQuery(gameQueries.search(text, year))

  // Wikipedia pagination can repeat a page across offsets: keep the first occurrence.
  const games = useMemo(() => {
    const seen = new Set<string>()
    return (search.data?.pages ?? []).flatMap((page) => page.games).filter((game) => !seen.has(game.id) && !!seen.add(game.id))
  }, [search.data])

  const heading = text ? t.discover.headingResults(text) : year ? t.discover.headingYear(year) : t.discover.heading
  useDocumentTitle(text ? heading : t.discover.title)

  // 4.1.3: tell screen reader users how a new search or filter turned out.
  const firstPage = search.data?.pages[0]
  useEffect(() => {
    if (!firstPage) return
    const count = firstPage.games.length
    announce(count === 0 ? t.discover.noResults : t.discover.resultCount(heading, count, firstPage.nextOffset !== null))
  }, [firstPage, heading, t])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 tabIndex={-1} className="text-3xl font-bold tracking-tight text-balance text-text focus:outline-none sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted">{t.discover.intro}</p>
        </div>
        <YearSelect value={year} onChange={setYear} />
      </div>

      {search.isPending ? (
        <GameGridSkeleton label={t.discover.loading} />
      ) : search.isError && !search.data ? (
        <EmptyState icon={<WifiOff className="size-6" />} title={t.discover.loadError}>
          <p role="alert">{describeError(search.error, t)}</p>
          <button type="button" className="mt-3 min-h-11 font-medium text-accent hover:underline" onClick={() => search.refetch()}>
            {t.discover.tryAgain}
          </button>
        </EmptyState>
      ) : games.length === 0 ? (
        <EmptyState icon={<SearchX className="size-6" />} title={t.discover.noResults}>
          {t.discover.noResultsHint(year !== null)}
        </EmptyState>
      ) : (
        <>
          <GameGrid
            label={t.discover.grid}
            games={games}
            onOpen={onOpen}
            // After a failed page, stop auto-loading (it would retry in a loop) and offer an explicit retry.
            hasMore={search.hasNextPage && !search.isFetchNextPageError}
            isLoadingMore={search.isFetchingNextPage}
            onLoadMore={search.fetchNextPage}
          />
          {search.isFetchNextPageError && (
            <div role="alert" className="flex flex-wrap items-center justify-center gap-3 pt-8 text-sm text-text">
              <p>{t.discover.loadMoreError(search.error ? describeError(search.error, t) : '')}</p>
              <button
                type="button"
                disabled={search.isFetchingNextPage}
                onClick={() => search.fetchNextPage()}
                className="h-11 rounded-full border border-control bg-surface px-5 font-medium hover:bg-surface-2 disabled:opacity-50"
              >
                {search.isFetchingNextPage ? t.discover.retrying : t.discover.tryAgain}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
