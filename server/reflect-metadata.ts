/**
 * The three Reflect metadata functions tsyringe calls (it refuses to load without them), so the server doesn't
 * need the `reflect-metadata` package. Every dependency is injected with an explicit `@inject(token)` and there
 * is no `emitDecoratorMetadata`, so tsyringe only stores and reads its own injection tokens here.
 * Import this module before any decorated class.
 */
declare global {
  namespace Reflect {
    function defineMetadata(key: unknown, value: unknown, target: object): void
    function getOwnMetadata(key: unknown, target: object): unknown
    function getMetadata(key: unknown, target: object): unknown
  }
}

const metadata = new WeakMap<object, Map<unknown, unknown>>()

function ownMetadata(target: object): Map<unknown, unknown> {
  let map = metadata.get(target)
  if (!map) {
    map = new Map()
    metadata.set(target, map)
  }
  return map
}

Object.assign(Reflect, {
  defineMetadata(key: unknown, value: unknown, target: object): void {
    ownMetadata(target).set(key, value)
  },
  getOwnMetadata(key: unknown, target: object): unknown {
    return metadata.get(target)?.get(key)
  },
  /** Like getOwnMetadata, but also looks up the prototype chain (a subclass inherits its parent's metadata). */
  getMetadata(key: unknown, target: object): unknown {
    for (let current: object | null = target; current; current = Object.getPrototypeOf(current)) {
      const map = metadata.get(current)
      if (map?.has(key)) return map.get(key)
    }
    return undefined
  },
})

export {}
