import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { BackupActions } from './backup-actions'

afterEach(() => vi.restoreAllMocks())

function upload(input: HTMLInputElement, content: string) {
  const transfer = new DataTransfer()
  transfer.items.add(new File([content], 'backup.json', { type: 'application/json' }))
  input.files = transfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

it('links to the backup download', async () => {
  const screen = await renderWithProviders(<BackupActions />)
  await expect.element(screen.getByRole('link', { name: 'Export library backup' })).toHaveAttribute('href', '/api/library/backup')
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
