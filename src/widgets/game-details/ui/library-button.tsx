import type { GameSummary } from '@contracts/game'
import { BookmarkMinus, BookmarkPlus } from 'lucide-react'
import { useLibraryEntry, useRemoveEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { IconButton } from '@/shared/ui/icon-button'

/** Adds a game to the library, or removes it (with its score and flags) after confirmation. */
export function LibraryButton({ game }: { game: GameSummary }) {
  const inLibrary = useLibraryEntry(game.id) !== undefined
  const upsert = useUpsertEntry()
  const remove = useRemoveEntry()

  if (!inLibrary) {
    return (
      <IconButton
        label="Add to library"
        tone="accent"
        showLabel
        onClick={() => upsert.mutate({ game, patch: {} })}
        icon={<BookmarkPlus className="size-4" aria-hidden="true" />}
      />
    )
  }

  return (
    <IconButton
      label="Remove from library"
      showLabel
      onClick={() => {
        if (window.confirm(`Remove "${game.title}" from your library? Its score and status will be lost.`)) remove.mutate(game.id)
      }}
      icon={<BookmarkMinus className="size-4" aria-hidden="true" />}
    />
  )
}
