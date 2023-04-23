import type { Entity } from '../entity'

const store = new Set<Entity>()
let storeEnabled = false

/**
 * Enables the entity store that keeps references to all entities.
 *
 * This is particularly useful with `resetAll()` in component tests, where
 * it must be called at startup, **before** any entities are created.
 * In Jest, for example, you can do this by calling `enableStore()`
 * inside a Jest setup file.
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
