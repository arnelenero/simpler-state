import { getGlobalStore, initGlobalStore } from './globalStore'

import type { Entity } from './entity'
import type { GlobalStore } from './globalStore'

interface DevToolsEvent {
  type: string
  state: string
}

interface DevToolsConnection {
  init(state: GlobalStore): void
  send(action: { type: string }, state: GlobalStore): void
  subscribe(callback: (event: DevToolsEvent) => void): void
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect(options: { name?: string }): DevToolsConnection
    }
  }
}

let devTools: DevToolsConnection | null = null
let isInspectorEnabled = false
let isInspectorInitialized = false
let isDevToolsInitialized = false

/**
 * Enables the Inspector for visual debugging of entities using the
 * Redux Dev Tools browser extension.
 *
 * This function must be invoked at the topmost level, normally the React
 * app's `index` file. The optional `condition` typically checks if the
 * app is running in Production mode, in which case you would usually want
 * Inspector to be disabled.
 *
 * @see https://github.com/reduxjs/redux-devtools
 *
 * @param condition - should be `true` to enable Inspector
 */
export function enableInspector(condition = true) {
  isInspectorEnabled = condition
}

function initInspector() {
  devTools =
    (window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: document.title,
    }) as DevToolsConnection) ?? null

  if (devTools) {
    // Global store collects values of all entities (except private ones).
    const globalStore = initGlobalStore()

    // Subscribe to Dev Tools events to update the global store and have the
    // subscribed entities get notified about the change.
    // TODO: The `any` type is temporary until @redux-devtools/extension export is fixed.
    devTools.subscribe(event => {
      if (!isInspectorEnabled) return

      if (event.type === 'DISPATCH') {
        globalStore.set(JSON.parse(event.state))
      }
    })
  }

  isInspectorInitialized = true
}

export function onInit(entity: Entity) {
  // Private entities should not be inspected.
  if (entity.name.charAt(0) === '_') return

  // Initialize the inspector once on first opportunity.
  if (!isInspectorInitialized) initInspector()

  // Exit early if Dev Tools is not installed anyway.
  if (!devTools /*|| !isInspectorEnabled*/) return

  const globalStore = getGlobalStore()
  const mutableTree = globalStore.get()

  // Subscribe to Dev Tools triggered global store updates only once.
  if (!(entity.name in mutableTree)) {
    globalStore.subscribe(value => {
      if (!isInspectorEnabled) return

      entity.set(value[entity.name], '@@DEVTOOLS')
    })
  }

  // Save initial value to global store without notifying its subscribers.
  mutableTree[entity.name] = entity.get()

  // If global already initialized, it means this entity is lazy loaded.
  // Notify Dev Tools of the lazy initialization.
  if (isDevToolsInitialized && isInspectorEnabled) {
    devTools.send({ type: `${entity.name}:@@LAZY_INIT` }, mutableTree)
  }
}

export function onSet(entity: Entity, alias: string) {
  // Private entities should not be inspected.
  if (entity.name.charAt(0) === '_') return

  // Exit early if Dev Tools is not installed anyway.
  if (!devTools /*|| !isInspectorEnabled*/) return

  const globalStore = getGlobalStore()
  const mutableTree = globalStore.get()

  // Update the global store without notifying its subscribers.
  mutableTree[entity.name] = entity.get()

  // Nothing more to do if Inspector is disabled.
  if (!isInspectorEnabled) return

  // If this is the first setter call, initialize Dev Tools to the
  // initial value of the entire global store.
  if (!isDevToolsInitialized) {
    devTools.init(mutableTree)
    isDevToolsInitialized = true
  }

  // Notify Dev Tools of this update.
  devTools.send({ type: `${entity.name}:${alias}` }, mutableTree)
}
