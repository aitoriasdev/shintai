import { libraryBackupSchema, upsertEntrySchema } from '@contracts/library'
import { Hono } from 'hono'
import type { DependencyContainer } from 'tsyringe'
import { ProblemError } from '../http/problem'
import { parseJson } from '../http/validation'
import { LibraryService } from './library-service'

export function libraryRoutes(container: DependencyContainer) {
  const library = () => container.resolve(LibraryService)

  return new Hono()
    .get('/', (c) => c.json(library().list()))
    .put('/:gameId', async (c) => {
      const { game, patch } = await parseJson(c, upsertEntrySchema)
      if (game.id !== c.req.param('gameId')) throw new ProblemError('validation-failed', { detail: 'game.id: Does not match the URL', errors: [{ pointer: '#/game/id', detail: 'Does not match the URL' }] })
      return c.json(library().upsert(game, patch))
    })
    .delete('/:gameId', (c) => {
      if (!library().remove(c.req.param('gameId'))) throw new ProblemError('entry-not-found', { detail: `${c.req.param('gameId')} is not in the library` })
      return c.body(null, 204)
    })
    .get('/backup', (c) => {
      const backup = library().exportBackup()
      const date = new Date(backup.exportedAt).toISOString().slice(0, 10)
      c.header('Content-Disposition', `attachment; filename="shintai-backup-${date}.json"`)
      return c.json(backup)
    })
    .post('/backup', async (c) => c.json(library().importBackup(await parseJson(c, libraryBackupSchema))))
}
