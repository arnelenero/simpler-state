import entity from './entity'

import type { Entity } from './entity'

export type MutableMap = Record<string, any>

let registry: Entity<MutableMap>

// Creates the registry that holds a mapping of all entity values
// that are exposed to the Inspector, and thus to Dev Tools.
export function initRegistry() {
  // IMPORTANT: registry should be "private", i.e. its alias starts with _.
  // Otherwise, this will cause a circular dependency.
  registry = entity({}, '__GLOBAL__')
}

// Returns the mutable mapping of entity values from the registry.
export function getMutableMap(): MutableMap {
  return registry.get()
}

// Sets the registry value immutably (notifies subscribers)
export function updateRegistry(newValue: MutableMap) {
  registry.set(newValue)
}

// Subscribes to updates to the registry value.
export function watchRegistry(
  listener: (value: MutableMap) => void,
): () => void {
  return registry.subscribe(listener)
}
