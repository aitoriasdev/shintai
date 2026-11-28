import { container as rootContainer, type DependencyContainer } from 'tsyringe'
import { loadConfig } from '../config'
import { GameCatalogService } from '../games/game-catalog-service'
import { MemoryDetailsCache } from '../games/memory-details-cache'
import { WikipediaClient } from '../games/wikipedia-client'
import { TOKENS, type Clock, type FetchFn } from '../tokens'

/**
 * Composition root of the hosted demo (Vercel): the catalogue only, with an in-memory details cache, because serverless
 * functions have no persistent disk. Libraries live in each visitor's browser.
 */
export function createDemoContainer(overrides: { clock?: Clock; fetch?: FetchFn } = {}): DependencyContainer {
  const container = rootContainer.createChildContainer()
  container.register(TOKENS.Config, { useValue: loadConfig() })
  container.register(TOKENS.Clock, { useValue: overrides.clock ?? { now: () => Date.now() } })
  container.register(TOKENS.Fetch, { useValue: overrides.fetch ?? globalThis.fetch.bind(globalThis) })
  container.registerSingleton(WikipediaClient)
  container.registerSingleton(TOKENS.DetailsCache, MemoryDetailsCache)
  container.registerSingleton(GameCatalogService)
  return container
}
