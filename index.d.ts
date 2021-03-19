/**
 * Creates an entity and returns a direct reference
 * that provides get() and set() functions
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
 * @param entity - the entity reference
 * @param transform - optional data transformation function
 * @param equalityFn - optional custom equality function
 */
export function useEntity<T>(entity: Entity<T>): T
export function useEntity<T, C>(
  entity: Entity<T>,
  transform?: (value: T) => C,
  equalityFn?: (a: any, b: any) => boolean
): C

export interface Entity<T> {
  init: () => T
  get: () => T
  set: (
    newValue: T | ((value: T, ...args: any[]) => T),
    ...updaterArgs: any[]
  ) => void
  use: EntityHook<T>
}

export type EntityHook<T> = {
  (): T
  <C>(transform?: (value: T) => C, equalityFn?: (a: any, b: any) => boolean): C
}

/**
 * Hook that automatically resets the values of all entities
 * when the component unmounts, for proper cleanup.
 */
export function useEntityBoundary(): void

export function strictEqual(a: any, b: any): boolean
export function shallowEqual(a: any, b: any): boolean

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
  onInit?: (entity: Entity<any>, meta: M) => void
  onSet?: (entity: Entity<any>, meta: M) => void
  shouldIgnoreInit?: (meta: M) => boolean
  shouldIgnoreSet?: (meta: M) => boolean
}
