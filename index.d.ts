export function entity<T = any>(initialValue: T): Entity<T>

export function useEntity<C extends unknown = T>(
  entity: Entity<T>,
  options?: {
    transform?: (value: T) => C
    equalityFn?: (a: any, b: any) => boolean
  }
): C

export interface Entity<T> {
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

export interface Plugin {
  onCreate: () => void
  onFirstUse: () => void
  beforeSet: () => void
  afterSet: () => void
  onDestroy: () => void
}
