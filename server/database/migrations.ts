/**
 * Ordered schema migrations. The index + 1 is stored in `PRAGMA user_version`.
 * Never edit a shipped migration: append a new one instead.
 */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE library_entries (
    game_id     TEXT PRIMARY KEY,
    page_id     INTEGER NOT NULL,
    title       TEXT NOT NULL,
    wiki_title  TEXT NOT NULL,
    description TEXT,
    cover_url   TEXT,
    year        INTEGER,
    score       INTEGER CHECK (score IS NULL OR score BETWEEN 1 AND 10),
    completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    favorite    INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),
    added_at    INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
  ) STRICT;

  CREATE INDEX library_entries_added_at ON library_entries (added_at DESC);

  CREATE TABLE game_details_cache (
    page_id    INTEGER PRIMARY KEY,
    payload    TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  ) STRICT;
  `,
]
