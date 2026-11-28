import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Star } from 'lucide-react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { Badge } from '@/shared/ui/badge'

// Solid enough over any cover art for the status colour to keep its contrast.
const overCover = 'bg-background/90 font-semibold shadow-sm backdrop-blur-md'

/** Read-only status pills shown over a game cover. Favourites are conveyed by the pressed favourite toggle. */
export function EntryBadges({ entry }: { entry: LibraryEntry | undefined }) {
  const { t } = useI18n()
  if (!entry) return null
  return (
    <>
      {entry.score !== null && (
        <Badge variant="secondary" className={`${overCover} text-score`}>
          <Star className="size-3 fill-current" aria-hidden="true" />
          <span className="sr-only">{t.game.yourScore}: </span>
          {entry.score}
          <span className="sr-only"> {t.game.outOfTen}</span>
        </Badge>
      )}
      {entry.completed && (
        <Badge variant="secondary" className={`${overCover} text-completed`}>
          <CircleCheck className="size-3" aria-hidden="true" />
          {t.game.completed}
        </Badge>
      )}
    </>
  )
}
