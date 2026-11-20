import type { GameDetails, GameSummary } from '@contracts/game'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, X } from 'lucide-react'
import { useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { GameCover } from '@/entities/game/ui/game-cover'
import { LibraryButton } from './library-button'
import { ScorePicker } from './score-picker'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'
import { cn } from '@/shared/lib/cn'
import { Dialog } from '@/shared/ui/dialog'

const TITLE_ID = 'game-details-title'

function Facts({ details }: { details: GameDetails }) {
  const facts = [
    ['Released', details.releaseDate ? [details.releaseDate] : []],
    ['Platforms', details.platforms],
    ['Genres', details.genres],
    ['Developers', details.developers],
    ['Publishers', details.publishers],
  ] as const
  const visible = facts.filter(([, values]) => values.length > 0)
  if (visible.length === 0) return null

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {visible.map(([term, values]) => (
        <div key={term}>
          <dt className="mb-1.5 text-xs font-semibold tracking-wider text-muted uppercase">{term}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {values.map((value) => (
              <span key={value} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-text">
                {value}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Body({ game }: { game: GameSummary }) {
  const details = useQuery(gameQueries.details(game))
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-[14rem_1fr] sm:p-8">
      <GameCover
        title={game.title}
        src={details.data?.coverUrl ?? game.coverUrl}
        eager
        className="mx-auto w-40 rounded-2xl shadow-xl shadow-black/40 sm:w-full"
      />

      <div className="min-w-0 space-y-6">
        <header className="space-y-1 pr-10">
          <h2 id={TITLE_ID} className="text-2xl font-bold text-balance text-text sm:text-3xl">
            {game.title}
          </h2>
          {game.description && <p className="text-sm text-muted">{game.description}</p>}
        </header>

        <div className="flex flex-wrap gap-2">
          <LibraryButton game={game} />
          <FavoriteButton game={game} size="md" showLabel />
          <CompletedButton game={game} size="md" showLabel />
        </div>

        <section aria-label="Your score" className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wider text-muted uppercase">Your score</h3>
          <ScorePicker game={game} />
        </section>

        {details.isPending && (
          <div className="space-y-2" aria-busy="true" aria-label="Loading details">
            {[100, 95, 88, 60].map((width) => (
              <div key={width} className="h-3.5 animate-pulse rounded bg-surface-2" style={{ width: `${width}%` }} />
            ))}
          </div>
        )}

        {details.isError && (
          <p role="alert" className="text-sm text-danger">
            Could not load details: {details.error.message}{' '}
            <button type="button" className="underline" onClick={() => details.refetch()}>
              Retry
            </button>
          </p>
        )}

        {details.data && (
          <>
            {details.data.extract && (
              <section className="space-y-2">
                <p className={cn('text-sm leading-relaxed whitespace-pre-line text-text/85', !expanded && 'line-clamp-6')}>
                  {details.data.extract}
                </p>
                <button type="button" className="text-sm font-medium text-accent hover:underline" onClick={() => setExpanded((v) => !v)}>
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              </section>
            )}
            <Facts details={details.data} />
            <a
              href={details.data.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
            >
              Read more on Wikipedia
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </>
        )}
      </div>
    </div>
  )
}

interface GameDetailsDialogProps {
  game: GameSummary | null
  onClose: () => void
}

export function GameDetailsDialog({ game, onClose }: GameDetailsDialogProps) {
  // Keep rendering the last game while the dialog animates out.
  const [shown, setShown] = useState(game)
  if (game && game !== shown) setShown(game)

  return (
    <Dialog open={game !== null} onClose={onClose} labelledBy={TITLE_ID}>
      {shown && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:text-text"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <Body key={shown.id} game={shown} />
        </>
      )}
    </Dialog>
  )
}
