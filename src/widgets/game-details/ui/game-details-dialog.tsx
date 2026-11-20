import type { GameDetails, GameSummary } from '@contracts/game'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, X } from 'lucide-react'
import { useId, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { GameCover } from '@/entities/game/ui/game-cover'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'
import { cn } from '@/shared/lib/cn'
import { Dialog } from '@/shared/ui/dialog'
import { LibraryButton } from './library-button'
import { ScorePicker } from './score-picker'

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
    <section>
    <h3 className="sr-only">Facts</h3>
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
    </section>
  )
}

function Body({ game }: { game: GameSummary }) {
  const details = useQuery(gameQueries.details(game))
  const [expanded, setExpanded] = useState(false)
  const extractId = useId()

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-[14rem_1fr] sm:p-8">
      <GameCover
        title={game.title}
        src={details.data?.coverUrl ?? game.coverUrl}
        eager
        className="mx-auto w-40 rounded-2xl shadow-xl shadow-black/40 sm:w-full"
      />

      <div className="min-w-0 space-y-6">
        <div className="space-y-1 pr-12">
          <h2 id={TITLE_ID} className="text-2xl font-bold text-balance text-text sm:text-3xl">
            {game.title}
          </h2>
          {game.description && <p className="text-sm text-muted">{game.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <LibraryButton game={game} />
          <FavoriteButton game={game} size="md" showLabel />
          <CompletedButton game={game} size="md" showLabel />
        </div>

        <ScorePicker game={game} />

        {details.isPending && (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading details…</span>
            {[100, 95, 88, 60].map((width) => (
              <div key={width} aria-hidden="true" className="h-3.5 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" style={{ width: `${width}%` }} />
            ))}
          </div>
        )}

        {details.isError && (
          <p role="alert" className="text-sm text-danger">
            Could not load details: {details.error.message}{' '}
            <button type="button" className="font-medium underline" onClick={() => details.refetch()}>
              Retry
            </button>
          </p>
        )}

        {details.data && (
          <>
            {details.data.extract && (
              <section className="space-y-2">
                <h3 className="sr-only">About the game</h3>
                <p id={extractId} className={cn('text-sm leading-relaxed whitespace-pre-line text-text', !expanded && 'line-clamp-6')}>
                  {details.data.extract}
                </p>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={extractId}
                  className="min-h-9 text-sm font-medium text-accent hover:underline"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              </section>
            )}
            <Facts details={details.data} />
            <a
              href={details.data.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-text hover:underline"
            >
              Read more on Wikipedia
              <span className="sr-only"> (opens in a new tab)</span>
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
            className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-surface-2 text-text transition-colors hover:bg-border"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <Body key={shown.id} game={shown} />
        </>
      )}
    </Dialog>
  )
}
