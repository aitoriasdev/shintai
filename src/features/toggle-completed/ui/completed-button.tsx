import type { GameSummary } from '@contracts/game'
import { CircleCheck } from 'lucide-react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { IconButton } from '@/shared/ui/icon-button'

interface CompletedButtonProps {
  game: GameSummary
  size?: 'sm' | 'md'
  showLabel?: boolean
}

/** Toggles the completed flag. Adds the game to the library if needed. */
export function CompletedButton({ game, size = 'sm', showLabel = false }: CompletedButtonProps) {
  const completed = useLibraryEntry(game.id)?.completed ?? false
  const upsert = useUpsertEntry()

  return (
    <IconButton
      label={completed ? 'Completed' : 'Mark as completed'}
      tone="completed"
      size={size}
      showLabel={showLabel}
      pressed={completed}
      onClick={() => upsert.mutate({ game, patch: { completed: !completed } })}
      icon={<CircleCheck className="size-4" aria-hidden="true" />}
    />
  )
}
