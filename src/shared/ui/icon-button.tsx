import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'neutral' | 'favorite' | 'completed' | 'accent' | 'danger'

const activeTone: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-text',
  favorite: 'bg-favorite/20 text-favorite border-favorite/40',
  completed: 'bg-completed/20 text-completed border-completed/40',
  accent: 'bg-accent/20 text-accent border-accent/40',
  danger: 'bg-danger/20 text-danger border-danger/40',
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name; also shown as a tooltip. */
  label: string
  icon: ReactNode
  /** When defined, the button behaves as a toggle and exposes `aria-pressed`. */
  pressed?: boolean
  tone?: Tone
  size?: 'sm' | 'md'
  /** Renders the label next to the icon. */
  showLabel?: boolean
}

export function IconButton({
  label,
  icon,
  pressed,
  tone = 'neutral',
  size = 'md',
  showLabel = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={showLabel ? undefined : label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-border font-medium',
        'backdrop-blur-md transition-[background-color,color,border-color,transform] duration-150',
        'hover:border-text/30 active:scale-90 disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        size === 'sm' ? 'h-8 min-w-8 text-xs' : 'h-10 min-w-10 text-sm',
        showLabel && (size === 'sm' ? 'px-3' : 'px-4'),
        pressed ? activeTone[tone] : 'bg-bg/70 text-muted hover:text-text',
        className,
      )}
      {...rest}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
