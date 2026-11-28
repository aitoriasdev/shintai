import { Search, X } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { useHotkey } from '@/shared/lib/use-hotkey'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/shared/ui/input-group'
import { Kbd } from '@/shared/ui/kbd'

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
    <div role="search" className="w-full">
      <InputGroup className="h-11 rounded-full bg-card dark:bg-card">
        <InputGroupAddon className="pl-3.5">
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
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
          className="text-sm text-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        <InputGroupAddon align="inline-end">
          {value ? (
            <InputGroupButton
              size="icon-sm"
              onClick={() => {
                onChange('')
                inputRef.current?.focus()
              }}
              aria-label={t.header.clearSearch}
              className="size-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X aria-hidden="true" />
            </InputGroupButton>
          ) : (
            <Kbd aria-hidden="true">/</Kbd>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
