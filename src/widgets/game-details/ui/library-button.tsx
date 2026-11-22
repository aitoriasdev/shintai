import type { GameSummary } from '@contracts/game'
import { BookmarkMinus, BookmarkPlus } from 'lucide-react'
import { useLibraryEntry, useRemoveEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { useI18n } from '@/shared/i18n/use-i18n'
import { IconButton } from '@/shared/ui/icon-button'

/** Adds a game to the library, or removes it (with its score and flags) after confirmation. */
export function LibraryButton({ game }: { game: GameSummary }) {
  const { t } = useI18n()
  const inLibrary = useLibraryEntry(game.id) !== undefined
  const upsert = useUpsertEntry()
  const remove = useRemoveEntry()

  if (!inLibrary) {
    return (
      <IconButton
        label={t.details.addToLibrary}
        tone="accent"
        showLabel
        onClick={() => upsert.mutate({ game, patch: {} })}
        icon={<BookmarkPlus className="size-4" aria-hidden="true" />}
      />
    )
  }

  return (
    <IconButton
      label={t.details.removeFromLibrary}
      showLabel
      onClick={() => {
        if (window.confirm(t.details.confirmRemove(game.title))) remove.mutate(game.id)
      }}
      icon={<BookmarkMinus className="size-4" aria-hidden="true" />}
    />
  )
}
