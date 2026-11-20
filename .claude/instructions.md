# Working on Shintai

Working rules for this repository. `README.md` has the overview, the architecture and the commands; `docs/accessibility.md` has the accessibility guidelines.

## Before you commit

Run `yarn check`. It runs `yarn typecheck`, `yarn lint` (oxlint + Steiger), `yarn test` (Vitest) and `yarn test:e2e` (Playwright with axe).

Never skip a failing check, never commit with `--no-verify`, and never relax a lint rule or delete a test to get a green run. Report what fails instead.

## Package management

- Yarn 4 through Corepack (`packageManager` in `package.json`), with the `node-modules` linker. Never use npm or pnpm, and never create `package-lock.json` or `pnpm-lock.yaml`.
- Yarn skips package versions published less than 24 hours ago (`npmMinimalAgeGate`). Don't override it. If `yarn add` reports a version as "quarantined", use the newest version that isn't.
- Prefer platform features over new dependencies (e.g. `node:sqlite`). A new dependency must be widely used, actively maintained and open source.

## Where code goes

- `src/`: the React UI, organised with Feature-Sliced Design: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only from layers below it. Steiger checks this (`yarn lint`).
  - Keep code inside its only consumer until a second one needs it. Example: the game grid lived in `pages/discover` until the library page needed it, then moved to `widgets/`.
- `server/`: the local API (Hono, tsyringe, `node:sqlite`). Every dependency is injected with `@inject(token)`. The composition root is `server/container.ts`, and schema changes are new entries in `server/database/migrations.ts` (never edit a shipped migration).
- `contracts/`: Zod schemas and inferred types shared by the API and the UI, one file per domain. The UI imports types only, so Zod stays out of the bundle.

### File names and imports

- **Every file name is kebab-case** (`game-card.tsx`, `use-in-view.ts`). Never camelCase or PascalCase. oxlint enforces this (`unicorn/filename-case`).
- **No barrel files.** Never create an `index.ts` (or any file) that re-exports other modules. Import from the file that defines the value (`@/entities/game/ui/game-card`).
- **Types live with the code that owns them.** There is no global `types.ts`.

## Testing

- **Tests sit next to the code they test.**
  - `*.spec.ts(x)` run in Vitest: under `src/` in Browser Mode (Playwright Chromium, with the real stylesheet), and under `server/` and `contracts/` in Node.
  - `*.e2e.ts` run in Playwright against the production build, the real API and an in-memory SQLite database.
- **Test behaviour, not implementation.** Query by role and accessible name (`getByRole('button', { name: 'Favorite: Celeste' })`).
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
- Validate every request with the Zod schemas from `contracts/`.

## Git and pull requests

- Branch from `main`. Use Conventional Commits: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`, `chore` (Dependabot uses `build(deps):` and `ci(deps):`).
- **`main` is protected** by the "Protect main" ruleset:
  - Every change goes through a pull request and is **squash-merged** (linear history, signed commits).
  - A PR can merge only after CodeQL has scanned it (`.github/workflows/codeql.yml`).
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

## Known pitfalls

- Node 25+ no longer bundles Corepack's shims in every setup. If `yarn` is missing or the wrong version, run `corepack enable`.
- Playwright's Chromium needs system libraries on Linux/WSL. Install them once with `yarn playwright install --with-deps chromium` (it asks for `sudo`).
