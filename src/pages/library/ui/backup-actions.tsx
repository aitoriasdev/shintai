import type { LibraryBackup } from '@contracts/library'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { importBackup, LIBRARY_BACKUP_URL } from '@/entities/library/api/library-api'
import { libraryQueries } from '@/entities/library/api/library-queries'
import { ApiError } from '@/shared/api/api-client'
import { describeError } from '@/shared/i18n/describe-error'
import type { Messages } from '@/shared/i18n/messages/en-gb'
import { useI18n } from '@/shared/i18n/use-i18n'

const actionClass =
  'inline-flex h-9 items-center gap-2 rounded-full border border-control bg-surface px-3 text-sm text-text transition-colors hover:bg-surface-2 disabled:opacity-50 pointer-coarse:h-11'

/** A problem with the chosen file itself, already worded for the user. */
class BackupFileError extends Error {}

async function readBackup(file: File, t: Messages) {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch (error) {
    throw new BackupFileError(t.backup.invalidJson, { cause: error })
  }
  // Cheap shape check for a friendly message; the API validates the full schema.
  if (typeof json !== 'object' || json === null || (json as { app?: unknown }).app !== 'shintai') {
    throw new BackupFileError(t.backup.notBackup)
  }
  return importBackup(json as LibraryBackup)
}

/** Download the library as JSON, or merge a previous backup into it. */
export function BackupActions() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const restore = useMutation({
    mutationFn: (file: File) => readBackup(file, t),
    onSuccess: ({ added, updated, skipped }) => setMessage(t.backup.imported(added, updated, skipped)),
    onError: (error) => {
      if (error instanceof BackupFileError) setMessage(error.message)
      // The API validates every entry; the import is all-or-nothing.
      else if (error instanceof ApiError && error.slug === 'validation-failed') setMessage(t.backup.invalidEntries)
      else setMessage(describeError(error, t))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: libraryQueries.list().queryKey }),
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={LIBRARY_BACKUP_URL} download className={actionClass}>
        <Download className="size-4" aria-hidden="true" />
        {t.backup.export}
        <span className="sr-only"> {t.backup.target}</span>
      </a>
      <button type="button" className={actionClass} onClick={() => inputRef.current?.click()} disabled={restore.isPending}>
        <Upload className="size-4" aria-hidden="true" />
        {t.backup.import}
        <span className="sr-only"> {t.backup.target}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        aria-label={t.backup.file}
        tabIndex={-1}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) restore.mutate(file)
        }}
      />
      {message && (
        <p role="status" className="text-xs text-muted">
          {message}
        </p>
      )}
    </div>
  )
}
