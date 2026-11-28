import type { GameSummary } from '@contracts/game'
import { m } from 'motion/react'
import { memo, type ReactNode } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { GameCover } from './game-cover'

interface GameCardProps {
  game: GameSummary
  onOpen: (game: GameSummary) => void
  /** Status badges rendered over the cover (top-left). */
  badges?: ReactNode
  /** Quick actions rendered over the cover (top-right). */
  actions?: ReactNode
  /** The card is in the first row: its cover is likely the largest image on first paint (LCP). */
  priority?: boolean
}

/**
 * A cover on the shelf: the box art carries the card, with the title and year underneath. The title
 * button is the single primary control and its click area is stretched over the whole card. The cover
 * is decorative, and DOM order (title → badges → actions) matches the reading order (1.3.2).
 */
export const GameCard = memo(function GameCard({ game, onOpen, badges, actions, priority = false }: GameCardProps) {
  const { t } = useI18n()
  // The year reads the same in every language; Wikipedia's description is English-only, so it is a fallback.
  const meta = game.year !== null ? { text: String(game.year) } : game.description ? { text: game.description, lang: 'en' } : { text: t.game.videoGame }

  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex h-full flex-col rounded-xl has-[h2_button:focus-visible]:outline-2 has-[h2_button:focus-visible]:outline-offset-4 has-[h2_button:focus-visible]:outline-primary"
    >
      <GameCover
        title={game.title}
        src={game.coverUrl}
        priority={priority}
        decorative
        className="rounded-xl shadow-md ring-1 ring-border transition-[box-shadow,translate] duration-200 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-primary motion-reduce:group-hover:translate-y-0"
      />
      <h2 className="mt-2.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
        <button
          type="button"
          onClick={() => onOpen(game)}
          className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {game.title}
        </button>
      </h2>
      <p lang={meta.lang} className="mt-0.5 line-clamp-1 text-xs text-muted-foreground tabular-nums">
        {meta.text}
      </p>
      {badges && <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-col items-start gap-1">{badges}</div>}
      {actions && <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">{actions}</div>}
    </m.article>
  )
})
