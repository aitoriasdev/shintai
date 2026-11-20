import type { GameSummary } from '@contracts/game'
import { X } from 'lucide-react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { cn } from '@/shared/lib/cn'

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

function scoreColor(score: number): string {
  if (score >= 8) return 'bg-completed text-black'
  if (score >= 5) return 'bg-score text-black'
  return 'bg-danger text-white'
}

/** Personal 1–10 score. Clicking the current score (or the clear button) removes it. */
export function ScorePicker({ game }: { game: GameSummary }) {
  const score = useLibraryEntry(game.id)?.score ?? null
  const upsert = useUpsertEntry()
  const setScore = (value: number | null) => upsert.mutate({ game, patch: { score: value } })

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Your score" className="grid flex-1 grid-cols-10 gap-1">
        {SCORES.map((value) => {
          const active = score !== null && value <= score
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === score}
              aria-label={`${value} out of 10`}
              onClick={() => setScore(value === score ? null : value)}
              className={cn(
                'h-9 rounded-lg text-sm font-bold transition-[background-color,color,transform] duration-150 active:scale-90',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                active && score !== null ? scoreColor(score) : 'bg-surface-2 text-muted hover:bg-border hover:text-text',
              )}
            >
              {value}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => setScore(null)}
        disabled={score === null}
        aria-label="Clear score"
        title="Clear score"
        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:text-text disabled:opacity-30"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
