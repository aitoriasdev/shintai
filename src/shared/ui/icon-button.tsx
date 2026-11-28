import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from 'cn'

type Tone = 'neutral' | 'favorite' | 'completed' | 'accent'

/** Pressed toggles switch to a solid fill: the state change does not rely on hue alone (1.4.1). */
const pressedTone: Record<Tone, string> = {
  neutral: 'border-foreground bg-foreground text-background',
  favorite: 'border-favorite bg-favorite text-on-status',
  completed: 'border-completed bg-completed text-on-status',
  accent: 'border-primary bg-primary text-primary-foreground',
}

const sizes = {
  // ≥ 36px with a fine pointer, 44px on touch screens (2.5.5).
  sm: 'h-9 min-w-9 text-xs pointer-coarse:h-11 pointer-coarse:min-w-11',
  md: 'h-11 min-w-11 text-sm',
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  /** Short visible label (or tooltip for icon-only buttons). Keep it constant for toggles. */
  label: string
  /** Extra context for assistive tech, e.g. the game title: "Favorite: Celeste". */
  context?: string
  icon: ReactNode
  /** When defined, the button is a toggle and exposes `aria-pressed`. */
  pressed?: boolean
  tone?: Tone
  size?: keyof typeof sizes
  /** Shows `label` next to the icon. */
  showLabel?: boolean
}

export function IconButton({
  label,
  context,
  icon,
  pressed,
  tone = 'neutral',
  size = 'md',
  showLabel = false,
  className,
  ...rest
}: IconButtonProps) {
  // The name always starts with the visible label (2.5.3 Label in Name).
  const accessibleName = context ? `${label}: ${context}` : label

  return (
    <button
      type="button"
      aria-label={accessibleName}
      aria-pressed={pressed}
      title={showLabel ? undefined : label}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border font-medium',
        'transition-[background-color,color,border-color,transform] duration-150 active:scale-90',
        'disabled:pointer-events-none disabled:opacity-50',
        sizes[size],
        showLabel && 'px-4',
        pressed ? pressedTone[tone] : 'border-input bg-background/80 text-foreground backdrop-blur-md hover:bg-muted',
        className,
      )}
      {...rest}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
