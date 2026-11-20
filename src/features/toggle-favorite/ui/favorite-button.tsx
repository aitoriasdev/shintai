import type { GameSummary } from '@contracts/game'
import { Heart } from 'lucide-react'
import { useLibraryEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/ui/icon-button'

interface FavoriteButtonProps {
  game: GameSummary
  size?: 'sm' | 'md'
  showLabel?: boolean
}

/** Toggles the favorite flag (adds the game to the library if needed). Named "Favorite: <title>". */
export function FavoriteButton({ game, size = 'sm', showLabel = false }: FavoriteButtonProps) {
  const favorite = useLibraryEntry(game.id)?.favorite ?? false
  const upsert = useUpsertEntry()

  return (
    <IconButton
      label="Favorite"
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
