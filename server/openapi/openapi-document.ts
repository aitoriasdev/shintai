import { gameDetailsSchema, gameSearchPageSchema, gameSearchQuerySchema, gameSummarySchema } from '@contracts/game'
import { entryPatchSchema, importResultSchema, libraryBackupSchema, libraryEntrySchema, upsertEntrySchema } from '@contracts/library'
import { PROBLEM_CONTENT_TYPE, PROBLEM_TYPE_BASE, PROBLEM_TYPES, type ProblemSlug, problemFieldErrorSchema, problemSchema } from '@contracts/problem'
import { z } from 'zod'

/**
 * OpenAPI 3.1 description of the Shintai API, generated from the same Zod schemas that validate
 * requests, so the docs cannot drift from the code. `yarn openapi` writes it to docs/api/openapi.json
 * (published by Scalar), and the API serves it at `GET /api/openapi.json`.
 */

const registry = z.registry<{ id: string }>()
const components = {
  GameSummary: gameSummarySchema,
  GameDetails: gameDetailsSchema,
  GameSearchPage: gameSearchPageSchema,
  LibraryEntry: libraryEntrySchema,
  EntryPatch: entryPatchSchema,
  UpsertEntryBody: upsertEntrySchema,
  LibraryBackup: libraryBackupSchema,
  ImportResult: importResultSchema,
  Problem: problemSchema,
  ProblemFieldError: problemFieldErrorSchema,
} as const
for (const [id, schema] of Object.entries(components)) registry.add(schema, { id })

type ComponentName = keyof typeof components
type JsonSchema = Record<string, unknown>

/** OpenAPI keeps schemas under `components`: drop the per-schema `$schema` and `$id` that JSON Schema output adds. */
function componentSchemas(): Record<string, JsonSchema> {
  // Input form: request bodies are described as clients send them (defaults applied by the API are optional).
  const { schemas } = z.toJSONSchema(registry, { io: 'input', uri: (id) => `#/components/schemas/${id}` })
  return Object.fromEntries(
    Object.entries(schemas).map(([id, { $schema: _schema, $id: _id, ...schema }]) => [id, schema as JsonSchema]),
  )
}

const ref = (name: ComponentName) => ({ $ref: `#/components/schemas/${name}` })
const json = (schema: JsonSchema) => ({ 'application/json': { schema } })

function problems(...slugs: ProblemSlug[]) {
  const byStatus = new Map<number, ProblemSlug[]>()
  for (const slug of slugs) byStatus.set(PROBLEM_TYPES[slug].status, [...(byStatus.get(PROBLEM_TYPES[slug].status) ?? []), slug])
  return Object.fromEntries(
    [...byStatus].map(([status, group]) => [
      String(status),
      {
        description: group.map((slug) => `[${slug}](${PROBLEM_TYPE_BASE}${slug}): ${PROBLEM_TYPES[slug].title}.`).join(' '),
        content: { [PROBLEM_CONTENT_TYPE]: { schema: ref('Problem') } },
      },
    ]),
  )
}

/** Every API request can be refused by the `localOnly()` guard. */
const GUARD_READ = ['forbidden-host'] as const
const GUARD_WRITE = ['forbidden-host', 'cross-site-request', 'unsupported-media-type'] as const

function searchParameters() {
  const { properties = {}, required = [] } = z.toJSONSchema(gameSearchQuerySchema, { io: 'input' }) as {
    properties?: Record<string, JsonSchema>
    required?: string[]
  }
  const descriptions: Record<string, string> = {
    q: 'Title to search for. Empty: the most notable games.',
    year: 'Only games first released in this year.',
    offset: 'Position of the first result, from `nextOffset` of the previous page.',
  }
  return Object.entries(properties).map(([name, schema]) => ({
    name,
    in: 'query',
    required: required.includes(name),
    description: descriptions[name],
    schema,
  }))
}

const gameIdParameter = {
  name: 'gameId',
  in: 'path',
  required: true,
  description: 'The game’s `id` (`GameSummary.id`).',
  schema: { type: 'string', pattern: '^(Q\\d+|enwiki:\\d+)$' },
}

export function createOpenApiDocument(version: string) {
  return {
    openapi: '3.1.1',
    info: {
      title: 'Shintai API',
      version,
      summary: 'Local API behind the Shintai app: the game catalogue, your library and its backups.',
      description:
        'The API runs only on your machine and binds to `127.0.0.1`. It rejects non-loopback `Host` headers, cross-site writes and non-JSON request bodies. Errors are [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details.',
      license: { name: 'MIT', identifier: 'MIT' },
    },
    servers: [{ url: 'http://127.0.0.1:4321', description: 'Default local server (`SHINTAI_PORT`)' }],
    tags: [
      { name: 'Games', description: 'The catalogue, from English Wikipedia and Wikidata.' },
      { name: 'Library', description: 'Your games, scores and flags, stored in SQLite.' },
      { name: 'Meta', description: 'Health and this document.' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Meta'],
          operationId: 'getHealth',
          summary: 'Check that the API is running',
          responses: {
            '200': { description: 'The API is up.', content: json({ type: 'object', properties: { status: { const: 'ok' } }, required: ['status'] }) },
            ...problems(...GUARD_READ),
          },
        },
      },
      '/api/openapi.json': {
        get: {
          tags: ['Meta'],
          operationId: 'getOpenApiDocument',
          summary: 'Get this OpenAPI document',
          responses: { '200': { description: 'OpenAPI 3.1 document.', content: json({ type: 'object' }) }, ...problems(...GUARD_READ) },
        },
      },
      '/api/games/search': {
        get: {
          tags: ['Games'],
          operationId: 'searchGames',
          summary: 'Search or browse the catalogue',
          description: 'Successful pages may be cached by the browser for an hour; errors never are.',
          parameters: searchParameters(),
          responses: {
            '200': { description: 'One page of games.', content: json(ref('GameSearchPage')) },
            ...problems('validation-failed', 'upstream-unavailable', ...GUARD_READ),
          },
        },
      },
      '/api/games/{pageId}/details': {
        get: {
          tags: ['Games'],
          operationId: 'getGameDetails',
          summary: 'Get a game’s article intro and facts',
          description: 'Cached in SQLite for 30 days.',
          parameters: [
            { name: 'pageId', in: 'path', required: true, description: 'English Wikipedia page id.', schema: { type: 'integer', minimum: 1 } },
            { name: 'qid', in: 'query', required: false, description: 'Wikidata Q-id, for the structured facts.', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'The game’s details.', content: json(ref('GameDetails')) },
            ...problems('validation-failed', 'game-not-found', 'upstream-unavailable', ...GUARD_READ),
          },
        },
      },
      '/api/library': {
        get: {
          tags: ['Library'],
          operationId: 'listLibrary',
          summary: 'List every library entry',
          responses: {
            '200': { description: 'All entries, most recently added first.', content: json({ type: 'array', items: ref('LibraryEntry') }) },
            ...problems(...GUARD_READ),
          },
        },
      },
      '/api/library/{gameId}': {
        put: {
          tags: ['Library'],
          operationId: 'upsertLibraryEntry',
          summary: 'Add a game and/or change its score and flags',
          description: 'Creates the entry if needed, then applies `patch`. `game.id` must match the URL.',
          parameters: [gameIdParameter],
          requestBody: { required: true, content: json(ref('UpsertEntryBody')) },
          responses: {
            '200': { description: 'The saved entry.', content: json(ref('LibraryEntry')) },
            ...problems('validation-failed', 'malformed-json', ...GUARD_WRITE),
          },
        },
        delete: {
          tags: ['Library'],
          operationId: 'removeLibraryEntry',
          summary: 'Remove a game, with its score and flags',
          parameters: [gameIdParameter],
          responses: { '204': { description: 'Removed.' }, ...problems('entry-not-found', ...GUARD_WRITE) },
        },
      },
      '/api/library/backup': {
        get: {
          tags: ['Library'],
          operationId: 'exportLibraryBackup',
          summary: 'Download a JSON backup',
          responses: {
            '200': {
              description: 'The whole library, as an attachment named `shintai-backup-YYYY-MM-DD.json`.',
              headers: { 'Content-Disposition': { schema: { type: 'string' } } },
              content: json(ref('LibraryBackup')),
            },
            ...problems(...GUARD_READ),
          },
        },
        post: {
          tags: ['Library'],
          operationId: 'importLibraryBackup',
          summary: 'Merge a JSON backup',
          description: 'All or nothing: every entry is validated first. For each game, the newer entry wins.',
          requestBody: { required: true, content: json(ref('LibraryBackup')) },
          responses: {
            '200': { description: 'What the merge changed.', content: json(ref('ImportResult')) },
            ...problems('validation-failed', 'malformed-json', ...GUARD_WRITE),
          },
        },
      },
    },
    components: { schemas: componentSchemas() },
  }
}
