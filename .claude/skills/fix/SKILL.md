---
name: fix
description: Use when you have lint, type or Feature-Sliced Design errors, or before committing code, to make sure it passes the required CI checks.
---

# Fix Lint and Type Errors

Shintai has no code formatter (no Prettier). The checks are oxlint, Steiger (Feature-Sliced Design) and `tsc`. CI runs them, plus the tests, as required status checks (`Typecheck`, `Lint`, `Test`, `E2E` in `.github/workflows/ci.yml`).

## Instructions

1. Run `yarn oxlint --fix` to apply oxlint's safe automatic fixes.
2. Run `yarn lint` (oxlint, then `steiger ./src`) and `yarn typecheck` (`tsc -b`) for what is left.
3. Fix the remaining issues by hand (see below), then run `yarn check` before committing. It runs the same commands as CI.
4. Report anything you could not fix, with the rule name and the file.

## Fixing by hand

- **`unicorn/filename-case`**: rename the file to kebab-case with `git mv`, then update every import of it. Never camelCase or PascalCase, also not for components or hooks.
- **`import/no-cycle`**: move the shared piece down to the lowest layer that both sides may import, or keep it inside its only consumer.
- **Steiger (`fsd/*`)**: a slice imports from a layer above it or from a sibling slice. Move the code to the right layer (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). `fsd/public-api` and `fsd/no-public-api-sidestep` are turned off on purpose, because the project has no barrel files.
- **`tsc`**: fix the type. Use `unknown` plus a check instead of `any`, and import API types from `contracts/`.

## Common Mistakes

- **Silencing a rule**: never add `oxlint-disable` comments, relax `.oxlintrc.json` or `steiger.config.ts`, or delete a test to get a green run.
- **Adding an `index.ts` to satisfy an import**: barrel files are banned. Import from the file that defines the value.
- **Stopping at `yarn lint`**: a type error or a failing test also blocks the pull request.
