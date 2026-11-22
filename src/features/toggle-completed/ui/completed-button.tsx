import type { GameSummary } from '@contracts/game'
import { CircleCheck } from 'lucide-react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { useI18n } from '@/shared/i18n/use-i18n'
import { IconButton } from '@/shared/ui/icon-button'

interface CompletedButtonProps {
  game: GameSummary
  size?: 'sm' | 'md'
  showLabel?: boolean
}

/** Toggles the completed flag (adds the game to the library if needed). Named "Completed: <title>". */
export function CompletedButton({ game, size = 'sm', showLabel = false }: CompletedButtonProps) {
  const completed = useLibraryEntry(game.id)?.completed ?? false
  const upsert = useUpsertEntry()
  const { t } = useI18n()

  return (
    <IconButton
      label={t.game.completed}
      context={game.title}
      tone="completed"
      size={size}
      showLabel={showLabel}
      pressed={completed}
      onClick={() => upsert.mutate({ game, patch: { completed: !completed } })}
      icon={<CircleCheck className="size-4" aria-hidden="true" />}
    />
  )
}
