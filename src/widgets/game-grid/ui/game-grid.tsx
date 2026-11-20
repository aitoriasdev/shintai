import type { GameSummary } from '@contracts/game'
import { type FocusEvent, useEffect, useLayoutEffect, useRef } from 'react'
import { GameCard } from '@/entities/game/ui/game-card'
import { useLibraryEntry } from '@/entities/library/api/library-queries'
import { EntryBadges } from '@/entities/library/ui/entry-badges'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'
import { useInView } from '@/shared/lib/use-in-view'
import { Spinner } from '@/shared/ui/spinner'

export const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

function GameGridItem({ game, onOpen }: { game: GameSummary; onOpen: (game: GameSummary) => void }) {
  const entry = useLibraryEntry(game.id)
  return (
    <GameCard
      game={game}
      onOpen={onOpen}
      badges={<EntryBadges entry={entry} />}
      actions={
        <>
          <FavoriteButton game={game} />
          <CompletedButton game={game} />
        </>
      }
    />
  )
}

interface GameGridProps {
  games: GameSummary[]
  onOpen: (game: GameSummary) => void
  label: string
  /** Infinite scrolling: called when the end of the grid approaches the viewport. */
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

/** Fallback when no card is left to take focus: the page heading (rendered with tabIndex -1). */
function focusPageHeading() {
  if (document.activeElement === document.body || document.activeElement === null) {
    document.querySelector<HTMLElement>('main h1')?.focus()
  }
}

/**
 * Keeps keyboard focus when the focused card disappears (e.g. un-favoriting it under the "Favorites"
 * filter): focus moves to the card that took its place, or to the page heading (2.4.3).
 */
function useFocusRecovery(games: GameSummary[]) {
  const listRef = useRef<HTMLUListElement>(null)
  const focusedIndex = useRef<number | null>(null)

  const onFocus = (event: FocusEvent<HTMLUListElement>) => {
    const item = (event.target as HTMLElement).closest('li')
    focusedIndex.current = item ? [...event.currentTarget.children].indexOf(item) : null
  }
  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    // Focus deliberately moved elsewhere (not lost because the card was removed).
    const movedOutside = !event.currentTarget.contains(event.relatedTarget as Node | null)
    if (movedOutside && (event.target as HTMLElement).isConnected) focusedIndex.current = null
  }

  useLayoutEffect(() => {
    const index = focusedIndex.current
    if (index === null || (document.activeElement !== document.body && document.activeElement !== null)) return
    const items = listRef.current?.children
    const next = items?.[Math.min(index, items.length - 1)]
    const target = next?.querySelector<HTMLElement>('h2 button')
    if (target) target.focus()
    else focusPageHeading()
  }, [games])

  // The whole grid can unmount (e.g. "No games match these filters") while it holds focus.
  useLayoutEffect(
    () => () => {
      if (focusedIndex.current !== null) queueMicrotask(focusPageHeading)
    },
    [],
  )

  return { listRef, onFocus, onBlur }
}

export function GameGrid({ games, onOpen, label, hasMore = false, isLoadingMore = false, onLoadMore }: GameGridProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { listRef, onFocus, onBlur } = useFocusRecovery(games)

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) onLoadMore?.()
  }, [inView, hasMore, isLoadingMore, onLoadMore])

  return (
    <section aria-label={label}>
      <ul ref={listRef} className={GRID_CLASS} onFocus={onFocus} onBlur={onBlur}>
        {games.map((game) => (
          <li key={game.id}>
            <GameGridItem game={game} onOpen={onOpen} />
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
