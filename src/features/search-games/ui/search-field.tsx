import { Search, X } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { useHotkey } from '@/shared/lib/use-hotkey'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Accessible label, also used as placeholder. */
  label: string
}

/** Search landmark. Press `/` anywhere to focus it, Escape to clear it. */
export function SearchField({ value, onChange, label }: SearchFieldProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  useHotkey(
    '/',
    useCallback((event: KeyboardEvent) => {
      event.preventDefault()
      inputRef.current?.focus()
    }, []),
  )

  return (
    <div role="search" className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.stopPropagation()
            onChange('')
          }
        }}
        placeholder={label}
        aria-label={label}
        aria-keyshortcuts="/"
        className="h-11 w-full rounded-full border border-control bg-surface pr-16 pl-10 text-sm text-text placeholder:text-muted focus-visible:border-accent [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label={t.header.clearSearch}
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-control px-1.5 text-xs text-muted">
          /
        </kbd>
      )}
    </div>
  )
}
