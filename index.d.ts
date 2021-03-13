/**
 * Creates an entity and returns a direct reference
 * that provides get() and set() functions
 * @param initialValue - required default value
 * @param meta - optional metadata object (for plug-ins)
 */
export function entity<T = any>(initialValue: T, meta?: object): Entity<T>

/**
 * Binds an entity to the component as a shared state
 * @param entity - the entity reference
 */
export function useEntity<T>(entity: Entity<T>): T
/**
 * Binds an entity to the component as a shared state
 * @param entity - the entity reference
 * @param transform - optional data transformation function
 * @param equalityFn - optional custom equality function
 */
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
export function plugin(
  pluginPkg: (options: object) => Plugin,
  options?: object
): void

export interface Plugin {
  onInit: (entity: Entity<any>, meta: object) => void
  onSet: (entity: Entity<any>, meta: object) => void
  shouldIgnoreInit: (meta: object) => boolean
  shouldIgnoreSet: (meta: object) => boolean
}
