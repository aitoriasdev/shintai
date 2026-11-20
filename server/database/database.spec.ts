import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import { migrate, openDatabase, transaction } from './database'

describe('openDatabase', () => {
  it('creates the schema and records its version', () => {
    const db = openDatabase(':memory:')
    const tables = db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name").all()
    expect(tables.map((t) => t.name)).toEqual(['game_details_cache', 'library_entries'])
    expect(db.prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 })
  })
})

describe('migrate', () => {
  it('only applies pending migrations', () => {
    const db = new DatabaseSync(':memory:')
    migrate(db, ['CREATE TABLE a (x INTEGER) STRICT;'])
    migrate(db, ['CREATE TABLE a (x INTEGER) STRICT;', 'CREATE TABLE b (y INTEGER) STRICT;'])
    expect(db.prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 })
  })

  it('rolls back a failing migration', () => {
    const db = new DatabaseSync(':memory:')
    expect(() => migrate(db, ['CREATE TABLE a (x INTEGER) STRICT; SELECT * FROM missing;'])).toThrow()
    expect(db.prepare('PRAGMA user_version').get()).toEqual({ user_version: 0 })
    expect(db.prepare("SELECT count(*) AS n FROM sqlite_schema WHERE name = 'a'").get()).toEqual({ n: 0 })
  })
})

it('transaction commits or rolls back atomically', () => {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE t (x INTEGER) STRICT')
  expect(() =>
    transaction(db, () => {
      db.exec('INSERT INTO t VALUES (1)')
      throw new Error('boom')
    }),
  ).toThrow('boom')
  transaction(db, () => db.exec('INSERT INTO t VALUES (2)'))
  expect(db.prepare('SELECT x FROM t').all()).toEqual([{ x: 2 }])
})
