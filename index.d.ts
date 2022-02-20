/**
 * Creates and returns a new entity
 * @param initialValue - required default value
 * @param plugins - optional array list of plug-ins
 */
export function entity<T = any>(
  initialValue: Promise<T>,
  plugins?: Plugin[]
): Entity<T | undefined>
export function entity<T = any>(initialValue: T, plugins?: Plugin[]): Entity<T>

/**
 * Binds an entity to the component as a shared state
 * @param entity - the entity
 * @param transform - optional data transformation function
 * @param equalityFn - optional custom equality function
 */
export function useEntity<T>(entity: Entity<T>): T
export function useEntity<T, C>(
  entity: Entity<T>,
  transform?: (value: T) => C,
  equalityFn?: (a: any, b: any) => boolean
): C

/**
 * An entity is the basic unit of shared state.
 */
export interface Entity<T> {
  /** Sets the entity to its initial value */
  init: () => void

  /** Returns the current value of the entity */
  get: () => T

  /** Updates the value of the entity */
  set: {
    (newValue: T): void
    <P extends unknown[]>(
      updaterFn: (value: T, ...args: P) => T,
      ...updaterArgs: P
    ): void
  }

  /** Binds the entity value to component state */
  use: EntityHook<T>
}

export type EntityHook<T> = {
  (): T
  <C>(transform?: (value: T) => C, equalityFn?: (a: any, b: any) => boolean): C
}

export function strictEqual(a: any, b: any): boolean
export function shallowEqual(a: any, b: any): boolean

/**
 * A plug-in extends the behavior of an entity by composing
 * on top of its original `init` and `set` methods.
 */
export interface Plugin {
  /**
   * Returns an override for the entity's `init` method
   * @param origSet - original `init`
   * @param entity - target entity
   */
  init?: (origInit: () => void, entity: Entity<any>) => () => void

  /**
   * Returns an override for the entity's `set` method
   * @param origSet - original `set`
   * @param entity - target entity
   */
  set?: (
    origSet: (...args: any[]) => void,
    entity: Entity<any>
  ) => (...args: any[]) => void
}

/**
 * Persistence plug-in enables storing entity values to
 * localStorage (default), sessionStorage or custom storage
 * (must implement the Web Storage API).
 * @param key - unique identifier
 * @param options - optional config for storage and serialization/deserialization
 */
export function persistence(
  key: string,
  options?: {
    storage?: 'local' | 'session' | Storage
    serializeFn?: (value: any) => string | Promise<string>
    deserializeFn?: (value: string) => any | Promise<any>
  }
): Plugin

/**
 * Storage implements both `getItem` and `setItem` methods
 * of the Web Storage API.
 */
export interface Storage {
  getItem: (key: string) => string | null | Promise<string> | Promise<null>
  setItem: (key: string, value: string) => void | Promise<void>
}

/**
 * Enables the global store
 *
 * This is particularly useful in tests, if you need to
 * call `resetAll()` for resetting all entities to their
 * initial value.
 *
 * This must be called at startup, **before** any entities
 * are created. In Jest, for example, you can do this by
 * calling `enableStore()` inside a Jest setup file.
 */
export function enableStore(): void

/**
 * Resets all entities to initial value
 *
 * This function uses the global store, so `enableStore()`
 * should be called at startup. Most common use-case for
 * this is in testing. You should rarely, if at all, use
 * this in your actual app code.
 *
 * @throws if global store is not enabled
 */
export function resetAll(): void
