import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  children?: ReactNode
}

export function EmptyState({ icon, title, children }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-border bg-surface text-muted">{icon}</div>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  )
}
