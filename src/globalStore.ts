import entity from './entity'

import type { Entity } from './entity'

export type GlobalStore = Record<string, any>

let globalStore: Entity<GlobalStore>

export function initGlobalStore(): Entity<GlobalStore> {
  // IMPORTANT: global store should be "private", i.e. its alias starts with _.
  // Otherwise, this will cause a circular dependency.
  globalStore = entity({}, '__GLOBAL__')

  return globalStore
}

export function getGlobalStore(): Entity<GlobalStore> {
  return globalStore
}
