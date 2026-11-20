# Accessibility

Shintai targets **WCAG 2.1 level AA**. Every page and the game dialog are checked automatically on each run of `yarn test:e2e`, and keyboard behavior is covered by component and end-to-end specs.

## How it is verified

| Layer | What runs | Where |
| --- | --- | --- |
| Automated scan | [axe-core](https://github.com/dequelabs/axe-core) with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `best-practice` rules, on Discover, the library (default and filtered), the details dialog and a 320 px viewport. Any violation fails the build. | `*.e2e.ts` via `src/shared/lib/testing/expect-accessible.ts` |
| Keyboard | Skip link, `/` shortcut, Escape, dialog focus containment and restoration, arrow keys in radio groups, focus moved to the page heading on navigation | Component specs (`*.spec.tsx`) and `*.e2e.ts` |
| Semantics | Accessible names and roles are asserted with role-based queries (`getByRole(…, { name })`) throughout the test suite | All specs |
| Contrast | Token ratios measured and documented in `src/app/styles/index.css` | Manual, see table below |

Automated tools catch only part of all issues. Before a release, also do a manual pass with a screen reader (NVDA + Firefox, or VoiceOver + Safari) and at 200 % zoom.

## Color contrast

| Pair | Ratio | Required |
| --- | --- | --- |
| Text `#ececf4` on background `#0b0b12` | 16.7:1 | 4.5:1 |
| Muted text `#9b9bb2` on surfaces | ≥ 6.0:1 | 4.5:1 |
| Accent `#9d84ff` on background / surface | 6.7:1 / 6.2:1 | 4.5:1 |
| Accent on its 20 % tint | 5.1:1 | 4.5:1 |
| Black on accent (selected pills, count badge) | 7.2:1 | 4.5:1 |
| Black on favorite / completed / score / danger | ≥ 6.5:1 | 4.5:1 |
| Control borders `#6b6b8a` on surfaces | ≥ 3.2:1 | 3:1 (1.4.11) |
| Focus outline (accent) on background | 6.7:1 | 3:1 (1.4.11) |

## Audit (November 2026)

The initial build was audited with axe and a manual review of every component. All findings below are fixed and covered by tests.

| # | Finding | WCAG | Severity | Fix |
| --- | --- | --- | --- | --- |
| 1 | Focus could leave the open dialog and reach the page behind it | 2.4.3, 4.1.2 | 🔴 Critical | The app root gets the `inert` attribute while a dialog is open; focus returns to the opener on close |
| 2 | Score picker and status filter were `role="radio"` buttons without arrow-key support | 2.1.1, 4.1.2 | 🔴 Critical | Rebuilt as native radio groups inside a `fieldset` with a `legend` |
| 3 | No way to bypass the header | 2.4.1 | 🟡 Major | "Skip to main content" link as the first tab stop |
| 4 | Input/select borders at 1.3:1 | 1.4.11 | 🟡 Major | `--color-control` token (≥ 3.2:1) for all interactive boundaries |
| 5 | White on accent 3.7:1, white on danger 3.0:1, accent on tint 4.2:1 | 1.4.3 | 🟡 Major | Brighter accent and black text on colored fills |
| 6 | Toggle buttons changed their name with state ("Add to favorites" ↔ "Favorite") and repeated on every card | 4.1.2, 2.4.6 | 🟡 Major | Constant names with context ("Favorite: Celeste") and `aria-pressed` |
| 7 | Library link's accessible name did not contain its visible text | 2.5.3 | 🟡 Major | Count rendered as `aria-hidden` badge plus screen-reader text |
| 8 | Stats used an invalid `<dl>` structure | 1.3.1 | 🟡 Major | Each `<dt>`/`<dd>` pair directly inside a `<div>` |
| 9 | Search results, filter counts and save failures were not announced | 4.1.3, 3.3.1 | 🟡 Major | Polite live region for counts; visible, persistent `role="alert"` toast for errors |
| 10 | Card button name included the cover's alt text and description | 1.1.1, 2.4.4 | 🟢 Minor | Decorative cover; the title is the only name, and its button stretches over the whole card |
| 11 | Headings jumped from h1 to h3; a second `banner` landmark inside the dialog | 1.3.1 | 🟢 Minor | Card titles are h2; no `<header>` inside the dialog |
| 12 | Static document title; focus stayed on the nav after switching views | 2.4.2, 2.4.3 | 🟢 Minor | Per-view titles; focus moves to the new `h1` |
| 13 | Year filter had no visible label | 3.3.2 | 🟢 Minor | Visible `<label>` |
| 14 | Infinite scroll was the only way to load more results | 2.1.1 | 🟢 Minor | "Load more games" button besides auto-loading |
| 15 | Pressed states differed by hue only | 1.4.1 | 🟢 Minor | Pressed toggles switch to a solid fill (a luminance change) |
| 16 | CSS hover/skeleton animations ignored reduced motion | 2.3.3 (AAA), best practice | 🟢 Minor | Global `prefers-reduced-motion` override; Motion uses `reducedMotion="user"` |
| 17 | "Show more" did not expose its state; external link did not say it opens a new tab | 4.1.2, 3.2.5 | 🟢 Minor | `aria-expanded` + `aria-controls`; "(opens in a new tab)" text |

## Conventions for new UI

- Prefer native elements: `<button>`, `<a>`, `<select>`, radio inputs in a `fieldset`. Reach for ARIA only when no native element fits.
- Toggles keep a constant name and expose state with `aria-pressed`. Name per-item controls with their context (`IconButton`'s `context` prop).
- Interactive boundaries use `border-control`; never encode state in hue alone.
- Interactive controls are at least 36 px (44 px on touch screens through `pointer-coarse:`). This exceeds WCAG 2.2's 24 px minimum (2.5.8) and meets the 44 px AAA target on touch.
- Announce asynchronous results with `announce()`. Report failures with `showError()`.
- Every new page or dialog gets an `expectAccessible(page)` check in its `*.e2e.ts`.
