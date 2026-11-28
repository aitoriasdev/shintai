import { Settings2 } from 'lucide-react'
import { useId, useState } from 'react'
import { isLocale, LOCALE_NAMES, LOCALES } from '@/shared/i18n/locales'
import { useI18n } from '@/shared/i18n/use-i18n'
import { NativeSelect } from '@/shared/ui/native-select'
import { cn } from 'cn'
import { ThemePicker } from './theme-picker'

/**
 * Theme and language, in a native popover: the browser handles Escape, light dismiss and the focus
 * order (the panel follows its button). `aria-expanded` is also set explicitly, because not every
 * screen reader derives it from `popovertarget`.
 */
export function PreferencesMenu() {
  const { t, locale, setLocale } = useI18n()
  const panelId = useId()
  const languageId = useId()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        popoverTarget={panelId}
        aria-expanded={open}
        aria-label={t.preferences.button}
        title={t.preferences.button}
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full border border-input text-muted-foreground transition-colors [anchor-name:--preferences] hover:bg-muted hover:text-foreground',
          open && 'bg-muted text-foreground',
        )}
      >
        <Settings2 className="size-5" aria-hidden="true" />
      </button>
      <div
        id={panelId}
        popover="auto"
        role="group"
        aria-label={t.preferences.button}
        onToggle={(event) => setOpen(event.newState === 'open')}
        className="preferences-popover w-76 max-w-[calc(100vw-2rem)] space-y-5 rounded-2xl border border-input bg-card p-4 text-foreground shadow-2xl"
      >
        <ThemePicker />
        <div className="border-t border-border pt-4">
          <label htmlFor={languageId} className="mb-2 block text-sm font-semibold text-foreground">
            {t.preferences.language}
          </label>
          <NativeSelect
            id={languageId}
            containerClassName="w-full"
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) setLocale(event.target.value)
            }}
            className="h-11 rounded-xl bg-card text-foreground"
          >
            {LOCALES.map((option) => (
              <option key={option} value={option} lang={option}>
                {LOCALE_NAMES[option]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </>
  )
}
