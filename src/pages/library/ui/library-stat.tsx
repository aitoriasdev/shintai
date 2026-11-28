import { cn } from 'cn'

interface LibraryStatProps {
  label: string
  value: string
  hint?: string
  /** Background class of the coloured dot. */
  tone: string
}

/**
 * Each stat is a `<div>` that directly wraps one `<dt>`/`<dd>` pair, as valid `<dl>` content requires (1.3.1).
 * The figure is shown first, but the label still comes first in the DOM and for screen readers.
 */
export function LibraryStat({ label, value, hint, tone }: LibraryStatProps) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
        <span className={cn('mr-2 inline-block size-2 -translate-y-1.5 rounded-full', tone)} aria-hidden="true" />
        {value}
        {hint && <span className="ml-2 text-sm font-medium tracking-normal text-muted-foreground">{hint}</span>}
      </dd>
    </div>
  )
}
