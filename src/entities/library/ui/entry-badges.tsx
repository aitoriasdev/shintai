import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Star } from 'lucide-react'
import { useI18n } from '@/shared/i18n/use-i18n'

const badge = 'inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-md'

/** Read-only status pills shown over a game cover. Favourites are conveyed by the pressed favourite toggle. */
export function EntryBadges({ entry }: { entry: LibraryEntry | undefined }) {
  const { t } = useI18n()
  if (!entry) return null
  return (
    <>
      {entry.score !== null && (
        <span className={`${badge} text-score`}>
          <Star className="size-3 fill-current" aria-hidden="true" />
          <span className="sr-only">{t.game.yourScore}: </span>
          {entry.score}
          <span className="sr-only"> {t.game.outOfTen}</span>
        </span>
      )}
      {entry.completed && (
        <span className={`${badge} text-completed`}>
          <CircleCheck className="size-3" aria-hidden="true" />
          {t.game.completed}
        </span>
      )}
    </>
  )
}
