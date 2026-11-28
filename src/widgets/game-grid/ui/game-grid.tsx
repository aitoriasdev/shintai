import type { GameSummary } from '@contracts/game'
import { useEffect } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { useInView } from '@/shared/lib/use-in-view'
import { Spinner } from '@/shared/ui/spinner'
import { GRID_CLASS } from '../lib/grid-class'
import { useFocusRecovery } from '../lib/use-focus-recovery'
import { GameGridItem } from './game-grid-item'

/**
 * The first covers are fetched first, because one of them is the LCP image. Only two: that is the first row on a phone,
 * and more high-priority images would compete for a slow connection and delay the LCP.
 */
const PRIORITY_COVERS = 2

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
  const { listRef, onFocus, onBlur } = useFocusRecovery(games)
  const { t } = useI18n()

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) onLoadMore?.()
  }, [inView, hasMore, isLoadingMore, onLoadMore])

  return (
    <section aria-label={label}>
      <ul ref={listRef} className={GRID_CLASS} onFocus={onFocus} onBlur={onBlur}>
        {games.map((game, index) => (
          <li key={game.id}>
            <GameGridItem game={game} onOpen={onOpen} priority={index < PRIORITY_COVERS} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={ref} className="flex justify-center pt-8">
          {isLoadingMore ? (
            <Spinner label={t.discover.loadingMore} />
          ) : (
            // Keyboard and switch users get an explicit control in addition to infinite scroll.
            <button
              type="button"
              onClick={onLoadMore}
              className="h-11 rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t.discover.loadMore}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
