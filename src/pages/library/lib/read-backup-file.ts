import type { LibraryBackup } from '@contracts/library'
import type { Messages } from '@/shared/i18n/messages/en-gb'
import { BackupFileError } from './backup-file-error'

/** Parses a chosen backup file. The library store validates every entry; this only gives friendly messages early. */
export async function readBackupFile(file: File, t: Messages): Promise<LibraryBackup> {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch (error) {
    throw new BackupFileError(t.backup.invalidJson, { cause: error })
  }
  if (typeof json !== 'object' || json === null || (json as { app?: unknown }).app !== 'shintai') {
    throw new BackupFileError(t.backup.notBackup)
  }
  return json as LibraryBackup
}
