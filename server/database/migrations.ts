/**
 * Ordered schema migrations. The index + 1 is stored in `PRAGMA user_version`.
 * Never edit a shipped migration: append a new one instead.
 */
export const MIGRATIONS: readonly string[] = [
  // 1 · Game details fetched from Wikipedia/Wikidata, cached as JSON.
  `
  CREATE TABLE game_details_cache (
    page_id    INTEGER PRIMARY KEY,
    payload    TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  ) STRICT;
  `,
]
