import type { GameSummary } from '@contracts/game'
import { X } from 'lucide-react'
import { useId, useState } from 'react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from 'cn'

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/** Score colors are paired with the number itself, so meaning never relies on color alone (1.4.1). */
function scoreColor(score: number): string {
  if (score >= 8) return 'bg-completed text-on-status'
  if (score >= 5) return 'bg-score text-on-status'
  return 'bg-destructive text-on-status'
}

/** Personal 1–10 score as a native radio group (arrow keys change it), plus an explicit clear button. */
export function ScorePicker({ game }: { game: GameSummary }) {
  const savedScore = useLibraryEntry(game.id)?.score ?? null
  const upsert = useUpsertEntry()
  const name = useId()
  const { t } = useI18n()

  // Controlled radios must reflect a choice synchronously; the cache catches up a tick later
  // (and rolls back on failure), so mirror it locally to avoid a checked/unchecked flicker.
  const [score, setLocalScore] = useState(savedScore)
  const [lastSaved, setLastSaved] = useState(savedScore)
  if (savedScore !== lastSaved) {
    setLastSaved(savedScore)
    setLocalScore(savedScore)
  }

  const setScore = (value: number | null) => {
    setLocalScore(value)
    upsert.mutate({ game, patch: { score: value } })
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-muted-foreground">{t.game.yourScore}</legend>
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-5 gap-1 sm:grid-cols-10">
          {SCORES.map((value) => (
            <label
              key={value}
              className={cn(
                'relative grid h-11 cursor-pointer place-items-center rounded-lg text-sm font-bold transition-[background-color,color] duration-150',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
                score !== null && value <= score ? scoreColor(score) : 'bg-muted text-foreground hover:bg-border',
              )}
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={value === score}
                onChange={() => setScore(value)}
                className="absolute inset-0 cursor-pointer appearance-none rounded-lg focus:outline-none"
              />
              {value}
              <span className="sr-only"> {t.game.outOfTen}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setScore(null)}
          disabled={score === null}
          className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <X className="size-4" aria-hidden="true" />
          {t.details.clear}
          <span className="sr-only"> {t.details.clearTarget}</span>
        </button>
      </div>
    </fieldset>
  )
}
