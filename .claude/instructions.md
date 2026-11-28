# Working on Shintai

Working rules for this repository. `README.md` has the overview, the architecture and the commands; `docs/accessibility.md` has the accessibility guidelines.

## Before you commit

Run `yarn check`. It runs `yarn typecheck`, `yarn lint` (oxlint + Steiger), `yarn test` (Vitest) and `yarn test:e2e` (Playwright with axe).

Never skip a failing check, never commit with `--no-verify`, and never relax a lint rule or delete a test to get a green run. Report what fails instead.

## Package management

- Yarn 4 through Corepack (`packageManager` in `package.json`), with the `node-modules` linker. Never use npm or pnpm, and never create `package-lock.json` or `pnpm-lock.yaml`.
- Yarn skips package versions published less than 24 hours ago (`npmMinimalAgeGate: "1d"` in `.yarnrc.yml`). Don't override it. If `yarn add` reports a version as "quarantined", use the newest version that isn't. The gate only applies when Yarn resolves a version: a version already in `yarn.lock` is not checked again, so don't keep one that was locked too early.
- Packages may not run install scripts (`enableScripts: false`). A package that really needs its script must be allowed one by one in `dependenciesMeta` in `package.json`; `esbuild` is marked `built: false` because its binary comes as an optional dependency.
- Yarn rewrites `.yarnrc.yml` (sorted keys, no comments), so explain its settings here, not in the file. The settings are documented at https://yarnpkg.com/configuration/yarnrc. Check `yarn --version` prints 4.x before running Yarn: a global Yarn 1 rewrites `yarn.lock` in the old v1 format.
- Prefer platform features over new dependencies (e.g. `node:sqlite`). A new dependency must be widely used, actively maintained and open source.

## Where code goes

- `src/`: the React UI, organised with Feature-Sliced Design: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only from layers below it. Steiger checks this (`yarn lint`).
  - Keep code inside its only consumer until a second one needs it. Example: the game grid lived in `pages/discover` until the library page needed it, then moved to `widgets/`.
- `server/`: the local API (Hono, tsyringe, `node:sqlite`). Every dependency is injected with `@inject(token)`. The composition root is `server/container.ts`, and schema changes are new entries in `server/database/migrations.ts` (never edit a shipped migration).
- `contracts/`: Zod schemas and inferred types shared by the API and the UI, one file per domain. The UI imports types only, so Zod stays out of the bundle.
  - The OpenAPI document (`docs/api/openapi.json`, published by Scalar) is generated from these schemas. After changing a route or a contract, run `yarn openapi`; a test fails while the file is out of date.
- **UI copy** lives in `src/shared/i18n/messages/`: `en-gb.ts` is the source (British spelling), `es-es.ts` implements the same `Messages` type. Never hard-code a string the user can see or hear; read it from `useI18n()` (or `getMessages()` outside React).
- **Folder boundaries** (oxlint `no-restricted-imports`, overrides in `.oxlintrc.json`):
  - `src/` never imports `server/`, `zod` or `node:*`, and imports `@contracts/*` with `import type` only. Playwright files (`*.e2e.ts`, `src/shared/lib/testing/`) are exempt, because they run in Node.
  - `server/` never imports `src/`, and imports contracts through `@contracts/*`.
  - `contracts/` imports neither `src/` nor `server/`, nor `node:*`; between contracts, it uses relative imports.

### File names and imports

- **Every file name is kebab-case** (`game-card.tsx`, `use-in-view.ts`). Never camelCase or PascalCase. oxlint enforces this (`unicorn/filename-case`).
- **No barrel files.** Never create an `index.ts` (or any file) that re-exports other modules. Import from the file that defines the value (`@/entities/game/ui/game-card`).
- **Types live with the code that owns them.** There is no global `types.ts`.

## Testing

- **Tests sit next to the code they test.**
  - `*.spec.ts(x)` run in Vitest: under `src/` in Browser Mode (Playwright Chromium, with the real stylesheet), and under `server/` and `contracts/` in Node.
  - `*.e2e.ts` run in Playwright against the production build, the real API and an in-memory SQLite database.
- **Test behaviour, not implementation.** Query by role and accessible name (`getByRole('button', { name: 'Favourite: Celeste' })`).
- In Vitest browser mode, `toHaveTextContent` compares the whole text (a regular expression is not treated as one) and `getByText` is exact. To check part of an element, find the part and assert on that.
- Every new page or dialog gets an `expectAccessible(page)` axe check in its `*.e2e.ts`.
- Bug fixes come with a regression test that fails without the fix.

## Accessibility

The app targets **WCAG 2.1 AA**. Follow the conventions in `docs/accessibility.md`:

- native controls first
- toggles with constant names and `aria-pressed`
- `border-control` for interactive boundaries
- `announce()` and `showError()` for status messages
- focus recovery when an interaction removes the focused element

## Security

- The API binds to `127.0.0.1` and its `localOnly()` guard rejects:
  - non-loopback `Host` headers (DNS rebinding)
  - cross-site writes (CSRF)
  - non-JSON request bodies

  Don't weaken it.
- Every response gets the security headers from `server/http/security-headers.ts` (strict CSP with Trusted Types, COOP/CORP `same-origin`, `Permissions-Policy`). Never add `'unsafe-inline'`, `'unsafe-eval'` or a wildcard source. Inline scripts in `index.html` are allowed by a hash the server computes at startup, so editing them needs no policy change. A new external origin (images, API calls) needs its directive updated; `security-headers.e2e.ts` fails on any CSP or Trusted Types violation.
- Validate every request with the Zod schemas from `contracts/`.
- Every error response is RFC 9457 Problem Details (`application/problem+json`). Throw `ProblemError` with a type from `PROBLEM_TYPES` in `contracts/problem.ts`; see the `error-messages` skill.

## Git and pull requests

- Branch from `main`. Use Conventional Commits: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`, `chore` (Dependabot uses `build(deps):` and `ci(deps):`).
- **`main` is protected** by the "Protect main" ruleset:
  - Every change goes through a pull request and is **squash-merged** (linear history, signed commits).
  - A PR can merge only after CodeQL has scanned it (`.github/workflows/codeql.yml`) and the four CI checks have passed: `Typecheck`, `Lint`, `Test` and `E2E` (`.github/workflows/ci.yml`, the same commands as `yarn check`). The branch must also be up to date with `main`.
  - If you add a script to `yarn check`, add a matching job to `ci.yml` and to the ruleset's required checks.
  - Force pushes and deleting `main` are blocked.
- **One PR per feature or concern.** Dependent work goes in a stacked series, each PR based on the previous branch and passing `yarn check` on its own. After squash-merging the bottom PR, rebase the rest of the stack onto `main`:

  ```bash
  git rebase --update-refs --onto origin/main <merged-branch> <top-branch>
  ```

  Then force-push with `--force-with-lease`.
- Fill in `.github/PULL_REQUEST_TEMPLATE.md`.

### Labels

**Every pull request gets labels, with no exceptions.** Add them when you create it (`gh pr create --label enhancement …`), or straight afterwards with `gh pr edit <number> --add-label <name>`.

Add one label for each kind of change in the PR (its Conventional Commit types):

| Change in the PR                                      | Label            |
| ----------------------------------------------------- | ---------------- |
| `feat`: new feature or behaviour                      | `enhancement`    |
| `fix`: bug fix                                        | `bug`            |
| `refactor` or `perf`: no change in behaviour          | `refactor`       |
| `test`: tests or test tooling                         | `tests`          |
| `docs`: documentation, README, Claude Code files      | `documentation`  |
| `build`: project structure, tooling, new dependencies | `project`        |
| `build(deps)`: dependency updates                     | `dependencies`   |
| GitHub Actions updates (with `dependencies`)          | `github_actions` |
| `ci`: workflows                                       | `ci/cd`          |
| `chore`: other maintenance                            | `chore`          |

Also add these when they apply, whatever the type:

| The PR…                                                    | Label           |
| ---------------------------------------------------------- | --------------- |
| Hardens security or fixes a vulnerability                  | `security`      |
| Improves accessibility (contrast, keyboard, screen reader) | `accessibility` |

- See the current labels with `gh label list`. Don't use `duplicate`, `invalid`, `question`, `wontfix`, `good first issue` or `help wanted` on pull requests you open; they're for triage.
- If no label fits, create one rather than leaving the PR unlabelled: `gh label create <name> --color <hex> --description "<one sentence>"`, lowercase and in the style of the existing ones. Add it to the tables above in the same PR.
- Dependabot labels its own PRs (`labels` in `.github/dependabot.yml`).

## Claude Code skills and agents

`CLAUDE.md` imports this file, so every Claude Code session loads these rules.

| Skill (`.claude/skills/`) | Use it…                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `fix`                     | for lint, type or FSD errors, and before committing                           |
| `error-messages`          | when adding or changing an error the user can see                             |
| `frontend-design`         | when building or reshaping UI (its "In Shintai" section comes first)          |
| `review-pr`               | before opening or merging a PR; runs the agents below                         |

The review agents in `.claude/agents/` (`code-reviewer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer`, `code-simplifier`) come from Anthropic's pr-review-toolkit and are adapted to this project. For a bug-focused review, use the built-in `/code-review`.

Third-party skills and agents are Apache-2.0 (Anthropic). Keep the comment at the top of each that says what was changed for Shintai. Name new skill folders in kebab-case; `SKILL.md` keeps the name Claude Code requires.

## Known pitfalls

- Node 25+ no longer bundles Corepack's shims in every setup. If `yarn` is missing or the wrong version, run `corepack enable`.
- Playwright's Chromium needs system libraries on Linux/WSL. Install them once with `yarn playwright install --with-deps chromium` (it asks for `sudo`).
