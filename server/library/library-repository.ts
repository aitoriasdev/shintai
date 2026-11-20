import type { LibraryEntry } from '@contracts/library'
import type { DatabaseSync } from 'node:sqlite'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../tokens'

interface EntryRow {
  game_id: string
  page_id: number
  title: string
  wiki_title: string
  description: string | null
  cover_url: string | null
  year: number | null
  score: number | null
  completed: number
  favorite: number
  added_at: number
  updated_at: number
}

function toEntry(row: EntryRow): LibraryEntry {
  return {
    game: {
      id: row.game_id,
      pageId: row.page_id,
      title: row.title,
      wikiTitle: row.wiki_title,
      description: row.description,
      coverUrl: row.cover_url,
      year: row.year,
    },
    score: row.score,
    completed: row.completed === 1,
    favorite: row.favorite === 1,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
  }
}

/** Persistence of library entries in the `library_entries` SQLite table. */
@injectable()
export class LibraryRepository {
  constructor(@inject(TOKENS.Database) private readonly db: DatabaseSync) {}

  list(): LibraryEntry[] {
    const rows = this.db.prepare('SELECT * FROM library_entries ORDER BY added_at DESC').all() as unknown as EntryRow[]
    return rows.map(toEntry)
  }

  find(gameId: string): LibraryEntry | null {
    const row = this.db.prepare('SELECT * FROM library_entries WHERE game_id = ?').get(gameId) as EntryRow | undefined
    return row ? toEntry(row) : null
  }

  save(entry: LibraryEntry): void {
    const { game } = entry
    this.db
      .prepare(
        `INSERT INTO library_entries
           (game_id, page_id, title, wiki_title, description, cover_url, year, score, completed, favorite, added_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (game_id) DO UPDATE SET
           page_id = excluded.page_id, title = excluded.title, wiki_title = excluded.wiki_title,
           description = excluded.description, cover_url = excluded.cover_url, year = excluded.year,
           score = excluded.score, completed = excluded.completed, favorite = excluded.favorite,
           added_at = excluded.added_at, updated_at = excluded.updated_at`,
      )
      .run(
        game.id,
        game.pageId,
        game.title,
        game.wikiTitle,
        game.description,
        game.coverUrl,
        game.year,
        entry.score,
        entry.completed ? 1 : 0,
        entry.favorite ? 1 : 0,
        entry.addedAt,
        entry.updatedAt,
      )
  }

  /** @returns whether an entry was removed. */
  delete(gameId: string): boolean {
    return Number(this.db.prepare('DELETE FROM library_entries WHERE game_id = ?').run(gameId).changes) > 0
  }

  deleteAll(): void {
    this.db.exec('DELETE FROM library_entries')
  }
}
