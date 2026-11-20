import { LoaderCircle } from 'lucide-react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
      <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}
