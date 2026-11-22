import type { ProblemSlug } from '@contracts/problem'
import { plural } from '../plural'

const LOCALE = 'en-GB'
const number = new Intl.NumberFormat(LOCALE).format
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent' }).format
const decimal = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format
const games = (count: number) => `${number(count)} ${plural(LOCALE, count, { one: 'game', other: 'games' })}`

/**
 * The source catalogue: every string the UI shows or announces. Other languages implement the same
 * `Messages` shape, so a missing or extra key is a type error.
 */
export const enGB = {
  app: {
    number,
    /** `<meta name="description">`; keep in sync with index.html. */
    description: 'Your personal gaming journal: every game you played, your score, what you completed and your favourites.',
    skipLink: 'Skip to main content',
    loading: 'Loading',
    close: 'Close',
    dismiss: 'Dismiss',
  },
  header: {
    nav: 'Main',
    discover: 'Discover',
    library: 'My library',
    libraryCount: (count: number) => `(${games(count)})`,
    searchAll: 'Search all games',
    searchLibrary: 'Search your library',
    clearSearch: 'Clear search',
  },
  preferences: {
    button: 'Preferences',
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
  },
  game: {
    favourite: 'Favourite',
    completed: 'Completed',
    videoGame: 'Video game',
    coverAlt: (title: string) => `${title} cover art`,
    noCover: (title: string) => `${title} (no cover art available)`,
    yourScore: 'Your score',
    outOfTen: 'out of 10',
  },
  discover: {
    title: 'Discover',
    heading: 'Notable games',
    headingYear: (year: number) => `Notable games of ${year}`,
    headingResults: (query: string) => `Results for “${query}”`,
    intro: 'Tens of thousands of games from Wikipedia. Open one to rate it.',
    releaseYear: 'Release year',
    anyYear: 'Any year',
    loading: 'Loading games',
    loadingMore: 'Loading more games',
    loadMore: 'Load more games',
    loadError: 'Could not load games',
    loadMoreError: (reason: string) => `Could not load more games: ${reason}`,
    tryAgain: 'Try again',
    retrying: 'Retrying…',
    noResults: 'No games found',
    noResultsHint: (withYear: boolean) => `Try a different spelling${withYear ? ' or another year' : ''}.`,
    resultCount: (heading: string, count: number, hasMore: boolean) =>
      `${heading}: ${hasMore ? `${number(count)} or more games` : games(count)}`,
    grid: 'Games',
  },
  library: {
    title: 'My library',
    intro: 'Every game you have played, rated and loved. Saved on this computer only.',
    loading: 'Loading your library',
    loadError: 'Could not load your library',
    emptyTitle: 'Your library is empty',
    emptyHint: 'Favourite, complete or rate any game and it lands here.',
    discoverGames: 'Discover games',
    noMatches: 'No games match these filters',
    shownCount: (shown: number, total: number) => `${number(shown)} of ${games(total)} shown`,
    grid: 'Library',
    stats: 'Statistics',
    statGames: 'Games',
    statCompleted: 'Completed',
    statFavourites: 'Favourites',
    statAverage: 'Average score',
    noScoreYet: 'None yet',
    /** `rate` is a whole percentage (0–100). */
    completionRate: (rate: number) => percent(rate / 100),
    averageScore: (score: number) => decimal(score),
    show: 'Show',
    filterAll: 'All',
    filterFavourites: 'Favourites',
    filterCompleted: 'Completed',
    filterPending: 'Not completed',
    sortBy: 'Sort by',
    sortRecent: 'Recently added',
    sortTitle: 'Title',
    sortScore: 'Score',
    sortYear: 'Release year',
  },
  backup: {
    export: 'Export',
    import: 'Import',
    target: 'library backup',
    file: 'Backup file',
    invalidJson: 'That file is not valid JSON.',
    notBackup: 'That file is not a Shintai backup.',
    invalidEntries: 'That backup has entries Shintai cannot read, so nothing was imported.',
    imported: (added: number, updated: number, skipped: number) =>
      `Imported: ${number(added)} added, ${number(updated)} updated, ${number(skipped)} unchanged.`,
  },
  details: {
    addToLibrary: 'Add to library',
    removeFromLibrary: 'Remove from library',
    confirmRemove: (title: string) => `Remove “${title}” from your library? Its score and status will be lost.`,
    clear: 'Clear',
    clearTarget: 'score',
    loading: 'Loading details',
    loadError: (reason: string) => `Could not load details: ${reason}`,
    retry: 'Retry',
    about: 'About the game',
    showMore: 'Show more',
    showLess: 'Show less',
    facts: 'Facts',
    released: 'Released',
    platforms: 'Platforms',
    genres: 'Genres',
    developers: 'Developers',
    publishers: 'Publishers',
    readMore: 'Read more on Wikipedia',
    newTab: '(opens in a new tab)',
  },
  errors: {
    saveFailed: 'Could not save your change, so it was undone. Is the Shintai API running?',
    offline: 'Could not reach the Shintai API. Is it running?',
    unexpected: 'Something went wrong in Shintai. Reload the page and try again.',
    /** One message per RFC 9457 problem type the API sends (see docs/api/problems.md). */
    problems: {
      'validation-failed': 'Some of the data sent to Shintai was not valid.',
      'malformed-json': 'The data sent to Shintai was not valid JSON.',
      'forbidden-host': 'Shintai only answers on this computer. Open it at 127.0.0.1 or localhost.',
      'cross-site-request': 'Another website tried to change your library, so Shintai blocked it.',
      'game-not-found': 'Wikipedia has no article for this game any more.',
      'entry-not-found': 'That game is no longer in your library.',
      'unsupported-media-type': 'Shintai only accepts JSON data.',
      'upstream-unavailable': 'Wikipedia is unavailable right now. Try again in a moment.',
    } satisfies Record<ProblemSlug, string>,
    /** Any other API problem: its own detail is already written for people in English. */
    request: (_status: number, serverMessage: string) => serverMessage,
  },
}

export type Messages = typeof enGB
