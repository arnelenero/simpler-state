/**
 * Creates and returns a new entity
 * @param initialValue - required default value
 * @param meta - optional metadata object (for plug-ins)
 */
export function entity<T = any>(initialValue: T): Entity<T>
export function entity<T = any>(initialValue: Promise<T>): Entity<T | undefined>
export function entity<T = any, M extends object = Record<any, any>>(
  initialValue: T,
  meta: M
): Entity<T>
export function entity<T = any, M extends object = Record<any, any>>(
  initialValue: Promise<T>,
  meta: M
): Entity<T | undefined>

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
 * Binds an entity to the component as a ref
 * @param entity - the entity
 * @param transform - optional data transformation function
 */
export function useEntityRef<T>(entity: Entity<T>): T
export function useEntityRef<T, C>(
  entity: Entity<T>,
  transform?: (value: T) => C
): C

export interface Entity<T> {
  init: () => void
  get: () => T
  set: (
    newValue: T | ((value: T, ...args: any[]) => T),
    ...updaterArgs: any[]
  ) => void
  use: EntityHook<T>
  useRef: EntityRefHook<T>
}

export type EntityHook<T> = {
  (): T
  <C>(transform?: (value: T) => C, equalityFn?: (a: any, b: any) => boolean): C
}

export type EntityRefHook<T> = {
  (): T
  <C>(transform?: (value: T) => C): C
}

export function strictEqual(a: any, b: any): boolean
export function shallowEqual(a: any, b: any): boolean

/**
 * Resets the values of all entities (for testing)
 */
export function resetAll(): void

/**
 * Attaches a plug-in to SimplerR State
 * @param pluginPkg - the plug-in package
 * @param options - optional configuration object
 */
export function plugin<O extends object>(
  pluginPkg: (options: O) => Plugin<any>,
  options?: O
): void

export interface Plugin<M extends object = Record<any, any>> {
  id: string
  init?: (origInit: () => void, get: () => any, meta: M) => () => void
  set?: (
    origSet: (...args: any[]) => void,
    get: () => any,
    meta: M
  ) => (...args: any[]) => void
}

/**
 * Resets all entities to initial value
 */
export function resetAll(): void
