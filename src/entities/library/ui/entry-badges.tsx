import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Heart, Star } from 'lucide-react'

/** Read-only status pills shown over a game cover. */
export function EntryBadges({ entry }: { entry: LibraryEntry | undefined }) {
  if (!entry) return null
  return (
    <>
      {entry.score !== null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs font-bold text-score backdrop-blur-md">
          <Star className="size-3 fill-current" aria-hidden="true" />
          <span aria-label={`Score ${entry.score} out of 10`}>{entry.score}</span>
        </span>
      )}
      {entry.completed && (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs font-semibold text-completed backdrop-blur-md">
          <CircleCheck className="size-3" aria-hidden="true" />
          Completed
        </span>
      )}
      {entry.favorite && (
        <span className="sr-only">
          <Heart aria-hidden="true" />
          Favorite
        </span>
      )}
    </>
  )
}
