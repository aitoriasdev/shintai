import type { GameSummary } from '@contracts/game'
import { useEffect } from 'react'
import { GameCard } from '@/entities/game/ui/game-card'
import { useInView } from '@/shared/lib/use-in-view'
import { Spinner } from '@/shared/ui/spinner'

export const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

interface GameGridProps {
  games: GameSummary[]
  onOpen: (game: GameSummary) => void
  label: string
  /** Infinite scrolling: called when the end of the grid approaches the viewport. */
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function GameGrid({ games, onOpen, label, hasMore = false, isLoadingMore = false, onLoadMore }: GameGridProps) {
  const { ref, inView } = useInView<HTMLDivElement>()

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) onLoadMore?.()
  }, [inView, hasMore, isLoadingMore, onLoadMore])

  return (
    <section aria-label={label}>
      <ul className={GRID_CLASS}>
        {games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={ref} className="flex justify-center pt-8">
          {isLoadingMore ? (
            <Spinner label="Loading more games" />
          ) : (
            // Keyboard and switch users get an explicit control in addition to infinite scroll.
            <button
              type="button"
              onClick={onLoadMore}
              className="h-11 rounded-full border border-control bg-surface px-5 text-sm font-medium text-text hover:bg-surface-2"
            >
              Load more games
            </button>
          )}
        </div>
      )}
    </section>
  )
}
