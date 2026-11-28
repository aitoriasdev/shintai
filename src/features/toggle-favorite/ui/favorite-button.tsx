import type { GameSummary } from '@contracts/game'
import { Heart } from 'lucide-react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from 'cn'
import { IconButton } from '@/shared/ui/icon-button'

interface FavoriteButtonProps {
  game: GameSummary
  size?: 'sm' | 'md'
  showLabel?: boolean
}

/** Toggles the favourite flag (adds the game to the library if needed). Named "Favourite: <title>". */
export function FavoriteButton({ game, size = 'sm', showLabel = false }: FavoriteButtonProps) {
  const favorite = useLibraryEntry(game.id)?.favorite ?? false
  const upsert = useUpsertEntry()
  const { t } = useI18n()

  return (
    <IconButton
      label={t.game.favourite}
      context={game.title}
      tone="favorite"
      size={size}
      showLabel={showLabel}
      pressed={favorite}
      onClick={() => upsert.mutate({ game, patch: { favorite: !favorite } })}
      icon={<Heart className={cn('size-4', favorite && 'fill-current')} aria-hidden="true" />}
    />
  )
}
