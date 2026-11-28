import type { LibraryBackup } from '@contracts/library'

/** Saves the backup as `shintai-backup-YYYY-MM-DD.json` through the browser's download. */
export function downloadBackup(backup: LibraryBackup): void {
  const date = new Date(backup.exportedAt).toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `shintai-backup-${date}.json`
  link.click()
  // The download has started from the click; the object URL is no longer needed.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
