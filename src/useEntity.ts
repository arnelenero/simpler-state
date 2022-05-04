import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { strictEqual } from './utils'

import type { Entity } from './entity'

/**
 * Hook that binds an entity to the component as a shared state.
 *
 * @param entity - the entity
 * @param transform - optional data transformation function
 * @param equality - optional custom equality function
 * @returns the current value of the entity
 */
function useEntity<T, C = T>(
  entity: Entity<T>,
  transform: (value: T) => C = (v: any) => v,
  equality: (a: C, b: C) => boolean = strictEqual,
): C {
  return useSyncExternalStoreWithSelector(
    entity.subscribe,
    entity.get,
    entity.get,
    transform,
    equality,
  )
}

export default useEntity
