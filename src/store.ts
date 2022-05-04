import type { Entity } from './entity'

const store = new Set<Entity>()
let storeEnabled = false

/**
 * Enables the entity store used for keeping references to all entities,
 * normally used with `resetAll()` in component tests.
 *
 * @param condition - optional condition for enabling the store
 */
export function enableStore(condition = true) {
  storeEnabled = condition
}

export function isStoreEnabled() {
  return storeEnabled
}

export function getStore() {
  return store
}
