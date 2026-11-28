# Shintai

Shintai is a personal web application for documenting a lifelong gaming journey: every game you played, your personal score, whether you completed it and which ones are your favorites.

It runs **only on your machine**. Your library lives in a local SQLite file; nothing is deployed anywhere.

## Features

- **Complete game catalog**: ~28k video games from English Wikipedia (every article with a video game infobox), with box art, short descriptions and infinite scrolling. Browse the most notable games, filter by release year or search by title. No API key needed.
- **Game details**: Wikipedia intro plus structured facts from Wikidata (release date, platforms, genres, developers, publishers). Cached in SQLite for 30 days.
- **Your library**: per game, a **1–10 personal score**, a **completed** flag and a **favorite** flag. Any of them adds the game to your library automatically.
- **Library tools**: stats (games, completion rate, favorites, average score), status filters, sorting, accent-insensitive search.
- **Backups**: export your library as JSON and import it back (merge: newer entries win).
- **Your language and theme**: British English or Spanish (Spain), and a system, light or dark theme. Both are in **Preferences** in the header and remembered on this computer.
- **Accessible**: targets WCAG 2.1 AA. Fully keyboard operable (`/` focuses search, `Esc` closes dialogs and clears search, arrow keys in radio groups), screen-reader friendly, contrast-checked, responsive down to 320 px, and respects "reduce motion". See [docs/accessibility.md](docs/accessibility.md).

## Getting started

Requirements: **Node.js ≥ 24** (uses the built-in `node:sqlite`) and **Yarn 4** (via Corepack).

```bash
corepack enable                 # once, provides the pinned Yarn version
yarn install
yarn playwright install chromium   # once, for the test suites

yarn start      # builds and serves the app at http://127.0.0.1:4321
```

For development, with hot reload for both the UI and the API:

```bash
yarn dev        # UI: http://localhost:5173 (proxies /api to the API on :4321)
```

### Configuration

| Variable          | Default            | Purpose                       |
| ----------------- | ------------------ | ----------------------------- |
| `SHINTAI_PORT`    | `4321`             | API (and production UI) port  |
| `SHINTAI_DB_PATH` | `./data/shintai.db` | SQLite database file         |

The server only binds to `127.0.0.1`, so it is never reachable from other machines. It also rejects requests that other websites could send from your browser while it runs: non-loopback `Host` headers (DNS rebinding), cross-site writes (CSRF) and non-JSON request bodies.

Every response carries security headers (`server/http/security-headers.ts`): a strict Content Security Policy (only the app's own files, cover art included, no inline code except the hashed theme script in `index.html`, no framing, Trusted Types), `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` set to `same-origin`, and a `Permissions-Policy` that turns off camera, microphone, location and similar features.

## Scripts

| Script            | What it does                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `yarn dev`        | API (`tsx watch`) + Vite dev server                                    |
| `yarn start`      | Production build, then serve UI + API from one process                 |
| `yarn typecheck`  | `tsc -b` for the app, the server and the tooling configs               |
| `yarn lint`       | oxlint (incl. kebab-case file names, import cycles) + Steiger (FSD)    |
| `yarn test`       | Vitest: component specs in real Chromium + server/contract specs in Node |
| `yarn test:e2e`   | Playwright end-to-end flows plus axe WCAG 2.1 AA scans, against the built app and in-memory SQLite |
| `yarn openapi`    | Regenerates `docs/api/openapi.json` from the Zod contracts (a test fails if it is out of date) |
| `yarn check`      | All of the above                                                       |

GitHub Actions runs the same four checks on every pull request (`.github/workflows/ci.yml`), and `main` accepts a pull request only when all of them pass.

## Architecture

```
contracts/   API contract shared by both sides (zod schemas + inferred types), split by domain
server/      Node API: Hono + tsyringe (DI) + SQLite (node:sqlite)
src/         React UI, organized with Feature-Sliced Design
```

### Server

- **Composition root** in `server/container.ts`: each app instance gets its own tsyringe child container. Every dependency is injected explicitly with `@inject(token)`, so no decorator metadata emit is needed.
- `games/`: `WikipediaClient` (Wikipedia Action API + Wikidata SPARQL, one retry on transient failures), `GameDetailsCache` (SQLite), `GameCatalogService`, routes.
- `library/`: `LibraryRepository` (SQLite), `LibraryService` (upserts, backups), routes.
- `database/`: connection setup (WAL) and versioned migrations (`PRAGMA user_version`), one per feature.
- All request input is validated with the zod schemas from `contracts/`.

| Endpoint                              | Description                               |
| ------------------------------------- | ----------------------------------------- |
| `GET /api/covers?src=&w=`             | A cover from Wikimedia, resized to 240 or 480 px wide, as WebP |
| `GET /api/games/search?q=&year=&offset=` | Search or browse the catalog           |
| `GET /api/games/:pageId/details?qid=` | Article intro + Wikidata facts (cached)   |
| `GET /api/library`                    | All library entries                       |
| `PUT /api/library/:gameId`            | Add a game and/or patch score/flags       |
| `DELETE /api/library/:gameId`         | Remove a game                             |
| `GET /api/library/backup`             | Download a JSON backup                    |
| `POST /api/library/backup`            | Merge a JSON backup                       |
| `GET /api/openapi.json`               | This API as an OpenAPI 3.1 document       |

Errors are [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details (`application/problem+json`); each `type` links to its section in [docs/api/problems.md](docs/api/problems.md). The API reference is published with [Scalar](https://scalar.com) from `scalar.config.json`, `docs/api/` and the generated `docs/api/openapi.json`.

### UI (Feature-Sliced Design)

| Layer       | Contents                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `app/`      | entrypoint, providers, hash routing, global styles                             |
| `pages/`    | `discover`, `library` (plus library-only filters, stats and backup actions)    |
| `widgets/`  | `app-header` (incl. preferences: theme and language), `game-grid`, `game-details` (incl. score picker, library button) |
| `features/` | `search-games`, `toggle-favorite`, `toggle-completed`                          |
| `entities/` | `game` (API, card, cover), `library` (API, ordered optimistic mutations, badges) |
| `shared/`   | API client (RFC 9457 errors), `i18n` (typed en-GB/es-ES catalogues, `Intl` formatting), hooks, accessible UI primitives (dialog, skip link, live announcer, error toast), test helpers |

Translations are plain typed objects: `messages/en-gb.ts` is the source and `es-es.ts` must match its shape, so a missing string is a type error. Numbers and plurals use `Intl`. Server state is handled by TanStack Query with optimistic updates; animations use Motion (`LazyMotion` + `domAnimation`); styling is Tailwind CSS v4 with [shadcn/ui](https://ui.shadcn.com) components in `src/shared/ui/` and a palette of traditional Japanese colours; icons are Lucide.

## Conventions

- **File names are always kebab-case** (enforced by `unicorn/filename-case`).
- **Folder boundaries are linted**: the UI never imports the server (and only types from `contracts/`), the server never imports the UI, and `contracts/` imports neither.
- **No barrel files.** Import from the file that defines a thing (`@/entities/game/ui/game-card`). Steiger's `public-api` rules are disabled accordingly; layer rules still apply.
- **Types live with the code that owns them**: there is no global `types.ts`.
- **Tests sit next to the code they cover**: `*.spec.ts(x)` for Vitest, `*.e2e.ts` for Playwright.
- **Accessibility is part of done**: native elements first, constant toggle names, `border-input` for interactive boundaries, and an `expectAccessible()` check for every new page or dialog ([guidelines](docs/accessibility.md#conventions-for-new-ui)).

## Data & privacy

The only outgoing requests are made by the local API, to Wikipedia/Wikidata (catalog data) and Wikimedia's image CDNs (cover art, resized and converted to WebP by `GET /api/covers`); the browser itself only talks to the local API. Your library never leaves `data/shintai.db`. Use **Export** on the library page to keep a backup.
