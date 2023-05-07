import { getStore, isStoreEnabled } from './store'

/**
 * Resets all entities to initial value.
 *
 * The most common use-case for this is in testing. You should rarely,
 * if at all, use this in actual app code. This function requires an
 * entity store, so `enableStore()` should be called at startup.
 *
 * @throws if entity store is not enabled
 */
export function resetAll() {
  if (!isStoreEnabled())
    throw new Error(
      'resetAll() requires the entity store. Call enableStore() at startup.',
    )

  getStore().forEach(entity => entity.init())
}
