import { Search, X } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useHotkey } from '@/shared/lib/use-hotkey'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

/** Search input. Press `/` anywhere to focus it. */
export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useHotkey(
    '/',
    useCallback((event: KeyboardEvent) => {
      event.preventDefault()
      inputRef.current?.focus()
    }, []),
  )

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onChange('')
            event.currentTarget.blur()
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-full border border-border bg-surface pr-16 pl-10 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-border px-1.5 text-xs text-muted">/</kbd>
      )}
    </div>
  )
}
