import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Star } from 'lucide-react'

const badge = 'inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-xs font-semibold backdrop-blur-md'

/** Read-only status pills shown over a game cover. Favorites are conveyed by the pressed favorite toggle. */
export function EntryBadges({ entry }: { entry: LibraryEntry | undefined }) {
  if (!entry) return null
  return (
    <>
      {entry.score !== null && (
        <span className={`${badge} text-score`}>
          <Star className="size-3 fill-current" aria-hidden="true" />
          <span className="sr-only">Your score: </span>
          {entry.score}
          <span className="sr-only"> out of 10</span>
        </span>
      )}
      {entry.completed && (
        <span className={`${badge} text-completed`}>
          <CircleCheck className="size-3" aria-hidden="true" />
          Completed
        </span>
      )}
    </>
  )
}
