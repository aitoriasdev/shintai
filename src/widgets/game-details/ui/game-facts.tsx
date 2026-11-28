import type { GameDetails } from '@contracts/game'
import { formatReleaseDate } from '@/shared/i18n/format-release-date'
import { useI18n } from '@/shared/i18n/use-i18n'
import { WIKIPEDIA_LANG } from '../lib/wikipedia-lang'

const pill = 'rounded-full bg-muted px-2.5 py-1 text-xs text-foreground'

/** Release date, platforms, genres, developers and publishers, as a description list. */
export function GameFacts({ details }: { details: GameDetails }) {
  const { locale, t } = useI18n()
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
            <dt className="mb-1.5 text-sm font-medium text-muted-foreground">{t.details.released}</dt>
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
            <dt className="mb-1.5 text-sm font-medium text-muted-foreground">{term}</dt>
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
