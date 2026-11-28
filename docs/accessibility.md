# Accessibility

Shintai targets **WCAG 2.1 level AA**. Every page and the game dialog are checked automatically on each run of `yarn test:e2e`, and keyboard behavior is covered by component and end-to-end specs.

## How it is verified

| Layer | What runs | Where |
| --- | --- | --- |
| Automated scan | [axe-core](https://github.com/dequelabs/axe-core) with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `best-practice` rules, on Discover, the library (default and filtered), the details dialog, the open preferences panel, a 320 px viewport, every page in the light theme and the Spanish interface. Any violation fails the build. | `*.e2e.ts` via `src/shared/lib/testing/expect-accessible.ts` |
| Keyboard | Skip link, `/` shortcut, Escape, dialog focus containment and restoration, arrow keys in radio groups, focus moved to the page heading on navigation | Component specs (`*.spec.tsx`) and `*.e2e.ts` |
| Semantics | Accessible names and roles are asserted with role-based queries (`getByRole(…, { name })`) throughout the test suite | All specs |
| Contrast | Token ratios measured and documented in `src/app/styles/index.css` | Manual, see table below |

Automated tools catch only part of all issues. Before a release, also do a manual pass with a screen reader (NVDA + Firefox, or VoiceOver + Safari) and at 200 % zoom.

## Color contrast

Both themes are measured. The tokens and their ratios are also recorded in `src/app/styles/index.css`. The palette uses [traditional colours of Japan](https://en.wikipedia.org/wiki/Traditional_colors_of_Japan): pastels on an indigo night in the dark theme, and the deeper tone of each hue on washi paper in the light theme, because pastels can't reach 4.5:1 as text on a light background.

### Dark theme ("indigo night")

| Pair | Ratio | Required |
| --- | --- | --- |
| Text aijiro `#ebf6f7` on background kachi-iro `#181b26` / surface `#232630` / surface-2 `#2d313b` | 15.6:1 / 13.7:1 / 11.8:1 | 4.5:1 |
| Muted text kamenozoki `#c6c2b6` on surfaces | ≥ 7.3:1 | 4.5:1 |
| Accent mizu-iro `#86aba5` on surfaces | ≥ 5.2:1 | 4.5:1 |
| Accent on its 15 % tint | 4.6:1 | 4.5:1 |
| Kachi-iro on accent (selected pills, count badge) | 6.9:1 | 4.5:1 |
| Favorite tokiha-iro `#f58f84` / completed byakuroku `#a5ba93` / score kuchinashi `#ffb95a` / danger akebono-iro `#fa7b62` text on surfaces | ≥ 5.0:1 | 4.5:1 |
| Kachi-iro on favorite / completed / score / danger (`on-status`) | ≥ 6.6:1 | 4.5:1 |
| Control borders minatonezumi `#757d75` on surfaces | ≥ 3.1:1 | 3:1 (1.4.11) |
| Focus outline (accent) on background | 6.9:1 | 3:1 (1.4.11) |

### Light theme ("washi paper")

| Pair | Ratio | Required |
| --- | --- | --- |
| Text sumi-iro `#27221f` on background `#faf3ee` / surface `#fefcfa` / surface-2 `#f6ece2` (torinoko tints) | 14.3:1 / 15.4:1 / 13.5:1 | 4.5:1 |
| Muted text sunezumi `#6e5f57` on surfaces | ≥ 5.2:1 | 4.5:1 |
| Accent `#2f6e7f` (chigusa-iro, deepened toward ai-iro) on surfaces | ≥ 4.9:1 | 4.5:1 |
| Accent on its 15 % tint | 4.6:1 | 4.5:1 |
| Paper on accent (selected pills, count badge) | 5.6:1 | 4.5:1 |
| Favorite enji-iro `#9d2933` / completed `#3f734e` (rokushō) / score kitsune-iro `#985629` / danger `#be3a28` (ake) text on surfaces | ≥ 4.7:1 | 4.5:1 |
| Paper on favorite / completed / score / danger (`on-status`) | ≥ 5.4:1 | 4.5:1 |
| Control borders `#918076` (ginnezumi) on surfaces | ≥ 3.2:1 | 3:1 (1.4.11) |
| Focus outline (accent) on background | 5.2:1 | 3:1 (1.4.11) |

Text on solid status fills uses the `on-status` token (kachi-iro in the dark theme, paper in the light one), never a fixed colour.

## Audit (November 2026)

The initial build was audited with axe and a manual review of every component. All findings below are fixed and covered by tests.

| # | Finding | WCAG | Severity | Fix |
| --- | --- | --- | --- | --- |
| 1 | Focus could leave the open dialog and reach the page behind it | 2.4.3, 4.1.2 | 🔴 Critical | The app root gets the `inert` attribute while a dialog is open; focus returns to the opener on close, or to the main content if the opener was removed |
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

### Follow-up code review

A code review of the full PR stack found three more accessibility issues. All are fixed and regression-tested.

| # | Finding | WCAG | Severity | Fix |
| --- | --- | --- | --- | --- |
| 18 | While a dialog was open, the error toast and live region were inside the inert app root: errors were neither announced nor dismissible | 4.1.3, 3.3.1 | 🔴 Critical | `LiveAnnouncer` and `ErrorToast` portal to `<body>`, outside the inert root |
| 19 | Focus fell back to `<body>` when the focused card disappeared (e.g. un-favoriting under the "Favorites" filter) | 2.4.3 | 🟡 Major | The grid moves focus to the card that took its place, or to the page heading |
| 20 | The `/` shortcut was ignored while a radio button had focus | 2.1.1 | 🟢 Minor | Only text-entry fields suppress shortcuts |

## Conventions for new UI

- Prefer native elements: `<button>`, `<a>`, `<select>`, radio inputs in a `fieldset`. Reach for ARIA only when no native element fits.
- Toggles keep a constant name and expose state with `aria-pressed`. Name per-item controls with their context (`IconButton`'s `context` prop).
- Interactive boundaries use `border-control`; never encode state in hue alone.
- Interactive controls are at least 36 px (44 px on touch screens through `pointer-coarse:`). This exceeds WCAG 2.2's 24 px minimum (2.5.8) and meets the 44 px AAA target on touch.
- Announce asynchronous results with `announce()`. Report failures with `showError()`. Global live regions must live outside the app root, which dialogs make inert.
- When an interaction can remove the focused element, move focus somewhere sensible (see `useFocusRecovery` in the game grid).
- Every new page or dialog gets an `expectAccessible(page)` check in its `*.e2e.ts`.
- New colours get a value in **both** themes (`@theme` for dark, `:root[data-theme='light']` for light), each measured and added to the tables above.
- Every string the UI shows or announces lives in `src/shared/i18n/messages/`. `<html lang>` follows the chosen language (3.1.1); text that stays English whatever the language (Wikipedia content) carries `lang="en"` (3.1.2).
- Language names are written in their own language and carry their own `lang`, so people can find theirs from any UI language.
