// The shim must load before tsyringe, which checks for it on import.
import './reflect-metadata'
import { inject, injectable, container as rootContainer, type InjectionToken } from 'tsyringe'
import { expect, it } from 'vitest'

const GREETING: InjectionToken<string> = Symbol('Greeting')

@injectable()
class Greeter {
  constructor(@inject(GREETING) readonly greeting: string) {}
}

it('stores and reads metadata per class, and through the prototype chain', () => {
  class Parent {}
  class Child extends Parent {}
  Reflect.defineMetadata('key', 'parent', Parent)

  expect(Reflect.getOwnMetadata('key', Parent)).toBe('parent')
  expect(Reflect.getOwnMetadata('key', Child)).toBeUndefined()
  expect(Reflect.getMetadata('key', Child)).toBe('parent')
  expect(Reflect.getMetadata('missing', Child)).toBeUndefined()
})

it('lets tsyringe resolve constructor injection by token', () => {
  const container = rootContainer.createChildContainer()
  container.register(GREETING, { useValue: 'Hello' })
  expect(container.resolve(Greeter).greeting).toBe('Hello')
})
