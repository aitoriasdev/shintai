import type { GameSummary } from '@contracts/game'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useId, useState } from 'react'
import { gameQueries } from '@/entities/game/api/game-queries'
import { GameCover } from '@/entities/game/ui/game-cover'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'
import { describeError } from '@/shared/i18n/describe-error'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from 'cn'
import { WIKIPEDIA_LANG } from '../lib/wikipedia-lang'
import { GameFacts } from './game-facts'
import { LibraryButton } from './library-button'
import { ScorePicker } from './score-picker'

/** The dialog's content: cover, title, library controls, score, Wikipedia intro and facts. */
export function GameDetailsBody({ game, titleId }: { game: GameSummary; titleId: string }) {
  const { t } = useI18n()
  const details = useQuery(gameQueries.details(game))
  const [expanded, setExpanded] = useState(false)
  const extractId = useId()

  return (
    // From `sm` up the cover stays in place and only the information column scrolls; on phones the cover sits
    // above the text and the whole panel scrolls, so the cover doesn't take a third of a small screen.
    <div className="grid gap-6 p-5 sm:flex sm:max-h-[calc(92dvh-2px)] sm:gap-0 sm:p-0">
      <GameCover
        title={game.title}
        src={details.data?.coverUrl ?? game.coverUrl}
        eager
        className="mx-auto w-40 rounded-2xl sm:m-8 sm:mr-0 sm:w-56 sm:shrink-0 sm:self-start"
      />

      <div className="min-w-0 space-y-6 sm:flex-1 sm:overflow-y-auto sm:overscroll-contain sm:p-8 sm:pl-6">
        <div className="space-y-1 pr-12">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
            {game.title}
          </h2>
          {game.description && (
            <p lang={WIKIPEDIA_LANG} className="text-sm text-muted-foreground">
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
              <div key={width} aria-hidden="true" className="h-3.5 animate-pulse rounded bg-muted motion-reduce:animate-none" style={{ width: `${width}%` }} />
            ))}
          </div>
        )}

        {details.isError && (
          <p role="alert" className="text-sm text-destructive">
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
                <p id={extractId} lang={WIKIPEDIA_LANG} className={cn('text-sm leading-relaxed whitespace-pre-line text-foreground', !expanded && 'line-clamp-6')}>
                  {details.data.extract}
                </p>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={extractId}
                  className="min-h-9 text-sm font-medium text-primary hover:underline"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? t.details.showLess : t.details.showMore}
                </button>
              </section>
            )}
            <GameFacts details={details.data} />
            <a
              href={details.data.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              hrefLang={WIKIPEDIA_LANG}
              className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
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
