import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { exportBackup, importBackup } from '@/entities/library/api/library-api'
import { libraryQueries } from '@/entities/library/api/library-queries'
import { InvalidBackupError } from '@/entities/library/lib/invalid-backup-error'
import { ApiError } from '@/shared/api/api-client'
import { describeError } from '@/shared/i18n/describe-error'
import { useI18n } from '@/shared/i18n/use-i18n'
import { Button } from '@/shared/ui/button'
import { BackupFileError } from '../lib/backup-file-error'
import { downloadBackup } from '../lib/download-backup'
import { readBackupFile } from '../lib/read-backup-file'

/** Download the library as JSON, or merge a previous backup into it. */
export function BackupActions() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const restore = useMutation({
    mutationFn: async (file: File) => importBackup(await readBackupFile(file, t)),
    onSuccess: ({ added, updated, skipped }) => setMessage(t.backup.imported(added, updated, skipped)),
    onError: (error) => {
      if (error instanceof BackupFileError) setMessage(error.message)
      // The library store validates every entry; the import is all or nothing.
      else if (error instanceof InvalidBackupError || (error instanceof ApiError && error.slug === 'validation-failed')) setMessage(t.backup.invalidEntries)
      else setMessage(describeError(error, t))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: libraryQueries.list().queryKey }),
  })

  const save = useMutation({
    mutationFn: exportBackup,
    onSuccess: downloadBackup,
    onError: (error) => setMessage(describeError(error, t)),
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" className="rounded-full pointer-coarse:h-11" onClick={() => save.mutate()} disabled={save.isPending}>
        <Download aria-hidden="true" />
        {t.backup.export}
        <span className="sr-only"> {t.backup.target}</span>
      </Button>
      <Button variant="outline" className="rounded-full pointer-coarse:h-11" onClick={() => inputRef.current?.click()} disabled={restore.isPending}>
        <Upload aria-hidden="true" />
        {t.backup.import}
        <span className="sr-only"> {t.backup.target}</span>
      </Button>
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
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
