import type { LibraryBackup } from '@contracts/library'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { importBackup, LIBRARY_BACKUP_URL } from '@/entities/library/api/library-api'
import { libraryQueries } from '@/entities/library/api/library-queries'

const actionClass =
  'inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50'

async function readBackup(file: File) {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  // Cheap shape check for a friendly message; the API validates the full schema.
  if (typeof json !== 'object' || json === null || (json as { app?: unknown }).app !== 'shintai') {
    throw new Error('That file is not a Shintai backup.')
  }
  return importBackup(json as LibraryBackup)
}

/** Download the library as JSON, or merge a previous backup into it. */
export function BackupActions() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const restore = useMutation({
    mutationFn: readBackup,
    onSuccess: ({ added, updated, skipped }) =>
      setMessage(`Imported: ${added} added, ${updated} updated, ${skipped} unchanged.`),
    onError: (error) => setMessage(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: libraryQueries.list().queryKey }),
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={LIBRARY_BACKUP_URL} download className={actionClass}>
        <Download className="size-4" aria-hidden="true" />
        Export
      </a>
      <button type="button" className={actionClass} onClick={() => inputRef.current?.click()} disabled={restore.isPending}>
        <Upload className="size-4" aria-hidden="true" />
        Import
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Backup file"
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
