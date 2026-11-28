import { container as rootContainer, type DependencyContainer } from 'tsyringe'
import type { AppConfig } from './config'
import { openDatabase } from './database/database'
import { CoverService } from './covers/cover-service'
import { GameCatalogService } from './games/game-catalog-service'
import { GameDetailsCache } from './games/game-details-cache'
import { WikipediaClient } from './games/wikipedia-client'
import { LibraryRepository } from './library/library-repository'
import { LibraryService } from './library/library-service'
import { TOKENS, type Clock, type FetchFn } from './tokens'

const systemClock: Clock = { now: () => Date.now() }

/**
 * Composition root. Every app instance gets its own child container (and therefore its own
 * singletons and database connection), which keeps tests fully isolated.
 */
export function createContainer(config: AppConfig, overrides: { clock?: Clock; fetch?: FetchFn } = {}): DependencyContainer {
  const container = rootContainer.createChildContainer()

  container.register(TOKENS.Config, { useValue: config })
  container.register(TOKENS.Database, { useValue: openDatabase(config.databasePath) })
  container.register(TOKENS.Clock, { useValue: overrides.clock ?? systemClock })
  container.register(TOKENS.Fetch, { useValue: overrides.fetch ?? globalThis.fetch.bind(globalThis) })

  container.registerSingleton(WikipediaClient)
  container.registerSingleton(CoverService)
  container.registerSingleton(GameDetailsCache)
  container.registerSingleton(GameCatalogService)
  container.registerSingleton(LibraryRepository)
  container.registerSingleton(LibraryService)
  return container
}
