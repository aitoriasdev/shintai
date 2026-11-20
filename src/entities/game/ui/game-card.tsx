import type { GameSummary } from '@contracts/game'
import { m } from 'motion/react'
import { memo, type ReactNode } from 'react'
import { GameCover } from './game-cover'

interface GameCardProps {
  game: GameSummary
  onOpen: (game: GameSummary) => void
  /** Status badges rendered over the cover (top-left). */
  badges?: ReactNode
  /** Quick actions rendered over the cover (top-right). */
  actions?: ReactNode
}

/**
 * Accessible card: the title button is the single primary control and its click area is stretched
 * over the whole card. The cover is decorative, and DOM order (title → badges → actions) matches the
 * reading order (1.3.2).
 */
export const GameCard = memo(function GameCard({ game, onOpen, badges, actions }: GameCardProps) {
  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/20 transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-accent has-[h2_button:focus-visible]:outline-2 has-[h2_button:focus-visible]:outline-offset-2 has-[h2_button:focus-visible]:outline-accent motion-reduce:hover:translate-y-0"
    >
      <GameCover title={game.title} src={game.coverUrl} decorative className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
      <div className="space-y-1 p-3">
        <h2 className="line-clamp-2 text-sm leading-snug font-semibold text-text">
          <button
            type="button"
            onClick={() => onOpen(game)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {game.title}
          </button>
        </h2>
        <p className="line-clamp-1 text-xs text-muted">{game.description ?? (game.year ? String(game.year) : 'Video game')}</p>
      </div>
      {badges && <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-col items-start gap-1">{badges}</div>}
      {actions && <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">{actions}</div>}
    </m.article>
  )
})
