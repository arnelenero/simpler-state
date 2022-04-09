import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { strictEqual } from './utils'

const identity = v => v

export const useEntity = (
  entity,
  transform = identity,
  equality = strictEqual
) => {
  if (!(entity._subscribers instanceof Set)) throw new Error('Invalid entity.')

  return useSyncExternalStoreWithSelector(
    entity._subscribe,
    entity.get,
    entity.get,
    transform,
    equality
  )
}

export default useEntity
