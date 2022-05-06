import entity from './entity'

import type { Entity } from './entity'

export type MutableMap = Record<string, any>

let globalStore: Entity<MutableMap>

// Creates the global store that holds a mapping of all entity values
// that are exposed to the Inspector, and thus to Dev Tools.
export function createGlobalStore() {
  // IMPORTANT: global store should be "private", i.e. its alias starts with _.
  // Otherwise, this will cause a circular dependency.
  globalStore = entity({}, '__GLOBAL__')
}

// Returns the mutable mapping of entity values from the global store.
export function getMutableMap(): MutableMap {
  return globalStore.get()
}

// Sets the global store value immutably (notifies subscribers)
export function updateGlobalStore(newValue: MutableMap) {
  globalStore.set(newValue)
}

// Subscribes to updates to the global store value.
export function watchGlobalStore(
  listener: (value: MutableMap) => void,
): () => void {
  return globalStore.subscribe(listener)
}
