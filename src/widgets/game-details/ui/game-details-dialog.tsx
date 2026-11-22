import type { GameDetails, GameSummary } from '@contracts/game'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, X } from 'lucide-react'
import { useId, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { GameCover } from '@/entities/game/ui/game-cover'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'
import { describeError } from '@/shared/i18n/describe-error'
import { formatReleaseDate } from '@/shared/i18n/format-release-date'
import type { Locale } from '@/shared/i18n/locales'
import type { Messages } from '@/shared/i18n/messages/en-gb'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from '@/shared/lib/cn'
import { Dialog } from '@/shared/ui/dialog'
import { LibraryButton } from './library-button'
import { ScorePicker } from './score-picker'

const TITLE_ID = 'game-details-title'

/** Wikipedia and Wikidata text is English whatever the UI language (3.1.2 Language of Parts). */
const WIKIPEDIA_LANG = 'en'

const pill = 'rounded-full bg-surface-2 px-2.5 py-1 text-xs text-text'

function Facts({ details, locale, t }: { details: GameDetails; locale: Locale; t: Messages }) {
  const facts = [
    [t.details.platforms, details.platforms],
    [t.details.genres, details.genres],
    [t.details.developers, details.developers],
    [t.details.publishers, details.publishers],
  ] as const
  const visible = facts.filter(([, values]) => values.length > 0)
  if (visible.length === 0 && !details.releaseDate) return null

  return (
    <section>
      <h3 className="sr-only">{t.details.facts}</h3>
      <dl className="grid gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
        {details.releaseDate && (
          <div>
            <dt className="mb-1.5 text-sm font-medium text-muted">{t.details.released}</dt>
            {/* Formatted in the UI language, so unlike the other facts it is not marked as English. */}
            <dd className="flex">
              <time dateTime={details.releaseDate} className={pill}>
                {formatReleaseDate(locale, details.releaseDate)}
              </time>
            </dd>
          </div>
        )}
        {visible.map(([term, values]) => (
          <div key={term}>
            <dt className="mb-1.5 text-sm font-medium text-muted">{term}</dt>
            <dd lang={WIKIPEDIA_LANG} className="flex flex-wrap gap-1.5">
              {values.map((value) => (
                <span key={value} className={pill}>
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
  const { locale, t } = useI18n()
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
          <h2 id={TITLE_ID} className="text-2xl font-bold tracking-tight text-balance text-text sm:text-3xl">
            {game.title}
          </h2>
          {game.description && (
            <p lang={WIKIPEDIA_LANG} className="text-sm text-muted">
              {game.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <LibraryButton game={game} />
          <FavoriteButton game={game} size="md" showLabel />
          <CompletedButton game={game} size="md" showLabel />
        </div>

        <ScorePicker game={game} />

        {details.isPending && (
          <div role="status" className="space-y-2">
            <span className="sr-only">{t.details.loading}…</span>
            {[100, 95, 88, 60].map((width) => (
              <div key={width} aria-hidden="true" className="h-3.5 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" style={{ width: `${width}%` }} />
            ))}
          </div>
        )}

        {details.isError && (
          <p role="alert" className="text-sm text-danger">
            {t.details.loadError(describeError(details.error, t))}{' '}
            <button type="button" className="min-h-9 font-medium underline" onClick={() => details.refetch()}>
              {t.details.retry}
            </button>
          </p>
        )}

        {details.data && (
          <>
            {details.data.extract && (
              <section className="space-y-2">
                <h3 className="sr-only">{t.details.about}</h3>
                <p id={extractId} lang={WIKIPEDIA_LANG} className={cn('text-sm leading-relaxed whitespace-pre-line text-text', !expanded && 'line-clamp-6')}>
                  {details.data.extract}
                </p>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={extractId}
                  className="min-h-9 text-sm font-medium text-accent hover:underline"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? t.details.showLess : t.details.showMore}
                </button>
              </section>
            )}
            <Facts details={details.data} locale={locale} t={t} />
            <a
              href={details.data.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              hrefLang={WIKIPEDIA_LANG}
              className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {t.details.readMore}
              <span className="sr-only"> {t.details.newTab}</span>
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
  const { t } = useI18n()
  const [shown, setShown] = useState(game)
  if (game && game !== shown) setShown(game)

  return (
    <Dialog open={game !== null} onClose={onClose} labelledBy={TITLE_ID}>
      {shown && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.app.close}
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
