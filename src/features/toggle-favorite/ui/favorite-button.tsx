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

/** Toggles the favorite flag. Adds the game to the library if needed. */
export function FavoriteButton({ game, size = 'sm', showLabel = false }: FavoriteButtonProps) {
  const favorite = useLibraryEntry(game.id)?.favorite ?? false
  const upsert = useUpsertEntry()

  return (
    <IconButton
      label={favorite ? 'Favorite' : 'Add to favorites'}
      tone="favorite"
      size={size}
      showLabel={showLabel}
      pressed={favorite}
      onClick={() => upsert.mutate({ game, patch: { favorite: !favorite } })}
      icon={<Heart className={cn('size-4 transition-transform', favorite && 'scale-110 fill-current')} aria-hidden="true" />}
    />
  )
}
