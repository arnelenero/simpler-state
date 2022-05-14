import {
  getMutableMap,
  initRegistry,
  updateRegistry,
  watchRegistry,
} from './registry'

import type { Entity } from './entity'
import type { MutableMap } from './registry'

interface DevToolsEvent {
  type: string
  state: string
}

interface DevToolsConnection {
  init(state: MutableMap): void
  send(action: { type: string }, state: MutableMap): void
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

export function initInspector() {
  devTools =
    (window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: document.title,
    }) as DevToolsConnection) ?? null

  if (devTools) {
    // The registry collects values of all entities (except private ones).
    initRegistry()

    // Subscribe to Dev Tools events to update the registry and have the
    // subscribed entities get notified about the change.
    devTools.subscribe(event => {
      if (!isInspectorEnabled) return

      if (event.type === 'DISPATCH') {
        updateRegistry(JSON.parse(event.state))
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
  if (!devTools) return

  const mutableMap = getMutableMap()

  // Subscribe to Dev Tools triggered registry updates only once.
  if (!(entity.name in mutableMap)) {
    watchRegistry(value => {
      if (!isInspectorEnabled) return

      entity.set(value[entity.name], '@@DEVTOOLS')
    })
  }

  // Save initial value to registry without notifying its subscribers.
  mutableMap[entity.name] = entity.get()

  // If global already initialized, it means this entity is lazy loaded.
  // Notify Dev Tools of the lazy initialization.
  if (isDevToolsInitialized && isInspectorEnabled) {
    devTools.send({ type: `${entity.name}:@@LAZY_INIT` }, mutableMap)
  }
}

export function onSet(entity: Entity, alias: string) {
  // Private entities should not be inspected.
  if (entity.name.charAt(0) === '_') return

  // Exit early if Dev Tools is not installed anyway.
  if (!devTools) return

  const mutableMap = getMutableMap()

  // Update the registry without notifying its subscribers.
  mutableMap[entity.name] = entity.get()

  // Nothing more to do if Inspector is disabled.
  if (!isInspectorEnabled) return

  // If this is the first setter call, initialize Dev Tools to the
  // initial value of the entire registry.
  if (!isDevToolsInitialized) {
    devTools.init(mutableMap)
    isDevToolsInitialized = true
  }

  // Notify Dev Tools of this update.
  devTools.send({ type: `${entity.name}:${alias}` }, mutableMap)
}
