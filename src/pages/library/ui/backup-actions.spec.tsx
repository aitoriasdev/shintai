import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, problemResponse } from '@/shared/lib/testing/fixtures'
import { BackupActions } from './backup-actions'

afterEach(() => vi.restoreAllMocks())

function upload(input: HTMLInputElement, content: string) {
  const transfer = new DataTransfer()
  transfer.items.add(new File([content], 'backup.json', { type: 'application/json' }))
  input.files = transfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

it('downloads the backup from the library as a dated JSON file', async () => {
  const backup = { app: 'shintai', version: 1, exportedAt: Date.UTC(2026, 10, 28), entries: [makeEntry()] }
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(({ url }) => Response.json(url.pathname === '/api/library/backup' ? backup : [])))
  const saved: { name: string; blob: Blob }[] = []
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    saved.push({ name: '', blob: blob as Blob })
    return 'blob:backup'
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    saved[saved.length - 1].name = this.download
  })
  const screen = await renderWithProviders(<BackupActions />)

  await screen.getByRole('button', { name: 'Export library backup' }).click()

  await expect.poll(() => saved.length).toBe(1)
  expect(saved[0].name).toBe('shintai-backup-2026-11-28.json')
  expect(JSON.parse(await saved[0].blob.text())).toEqual(backup)
})

it('imports a valid backup and reports the result', async () => {
  const posted: unknown[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method, body }) => {
      if (method === 'POST') {
        posted.push(body)
        return Response.json({ added: 1, updated: 0, skipped: 0 })
      }
      return Response.json([])
    }),
  )
  const screen = await renderWithProviders(<BackupActions />)
  const backup = { app: 'shintai', version: 1, exportedAt: 1, entries: [makeEntry()] }

  upload(screen.getByLabelText('Backup file').element() as HTMLInputElement, JSON.stringify(backup))

  await expect.element(screen.getByRole('status')).toHaveTextContent('Imported: 1 added, 0 updated, 0 unchanged.')
  expect(posted).toEqual([backup])
})

it('rejects files that are not Shintai backups without calling the API', async () => {
  const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const screen = await renderWithProviders(<BackupActions />)

  upload(screen.getByLabelText('Backup file').element() as HTMLInputElement, '{"hello":"world"}')

  await expect.element(screen.getByRole('status')).toHaveTextContent('That file is not a Shintai backup.')
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
})

it('says nothing was imported when the API rejects the entries', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method }) => (method === 'POST' ? problemResponse('validation-failed', { detail: 'entries.0.score: Too big' }) : Response.json([]))),
  )
  const screen = await renderWithProviders(<BackupActions />)
  const backup = { app: 'shintai', version: 1, exportedAt: 1, entries: [makeEntry({ score: 42 })] }

  upload(screen.getByLabelText('Backup file').element() as HTMLInputElement, JSON.stringify(backup))

  await expect.element(screen.getByRole('status')).toHaveTextContent('That backup has entries Shintai cannot read, so nothing was imported.')
})
