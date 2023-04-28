import {
  getMutableMap,
  initRegistry,
  updateRegistry,
  watchRegistry,
} from './registry'

import type { MutableMap } from './registry'
import type { Entity } from '../entity'

type DevToolsEvent =
  | {
      type: 'DISPATCH'
      payload: {
        type: string
        nextLiftedState?: {
          computedStates: { state: any }[]
          currentStateIndex?: number
        }
        [P: string]: any
      }
      state: string
    }
  | {
      type: 'ACTION'
      payload: string
    }

interface DevToolsConnection {
  init(state: MutableMap): void
  send(action: { type: string } | null, state: MutableMap): void
  subscribe(callback: (event: DevToolsEvent) => void): void
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect(options: {
        name?: string
        features?: Record<string, any>
      }): DevToolsConnection
    }
    __inspector?: {
      onInit: typeof onInit
      onSet: typeof onSet
    }
  }
}

let devTools: DevToolsConnection | null = null
let isInspectorEnabled = false
let isInspectorInitialized = false
let isDevToolsInitialized = false
let isDevToolsPaused = false
let initialRegistryValue: MutableMap | null = null

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
  window.__inspector = condition ? { onInit, onSet } : undefined
}

// Enabled Dev Tools features
export const features = {
  pause: true, // start/pause recording of dispatched actions
  export: true, // export history of actions in a file
  import: 'custom', // import history of actions from a file
  jump: true, // jump back and forth (time travelling)
  skip: true, // skip (cancel) actions
  reorder: true, // drag and drop actions in the history list
}

export function initInspector() {
  devTools =
    (window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: document.title,
      features,
    }) as DevToolsConnection) ?? null

  if (devTools) {
    // The registry collects values of all entities (except private ones).
    initRegistry()

    // Subscribe to Dev Tools events to synchronize the registry.
    devTools.subscribe(handleDevToolsEvent)
  }

  isInspectorInitialized = true
}

function handleDevToolsEvent(event: DevToolsEvent) {
  if (!isInspectorEnabled || !devTools) return

  if (event.type === 'DISPATCH') {
    switch (event.payload.type) {
      // "Time travel" to state selected in Dev Tools.
      case 'JUMP_TO_STATE':
      case 'JUMP_TO_ACTION':
        applyStateToEntities(event.state)
        break

      // Set current app state as initial state in Dev Tools.
      case 'COMMIT':
        devTools.init(getMutableMap())
        break

      // Revert to the last committed state in Dev Tools.
      case 'ROLLBACK':
        const snapshot = applyStateToEntities(event.state)
        if (snapshot) {
          devTools.init(snapshot)
        }
        break

      // Revert to original initial app state.
      case 'RESET':
        if (initialRegistryValue !== null) {
          updateRegistry(initialRegistryValue)
          devTools.init(initialRegistryValue)
        }
        break

      // Set app state to the current state imported (from file) into Dev Tools.
      case 'IMPORT_STATE': {
        const { nextLiftedState: imported } = event.payload
        if (!imported || !imported.computedStates) return

        const currentIndex =
          imported.currentStateIndex ?? imported.computedStates.length - 1
        const currentState = imported.computedStates[currentIndex]?.state
        if (typeof currentState !== 'object') return

        updateRegistry(currentState)
        devTools.send(null, imported)
        return
      }

      case 'PAUSE_RECORDING':
        isDevToolsPaused = !isDevToolsPaused
        break
    }
  }
}

function applyStateToEntities(state: string): MutableMap | undefined {
  let parsedState: MutableMap | undefined
  try {
    parsedState = JSON.parse(state)
  } catch (err) {
    console.error('Ignoring invalid state received from DevTools.')
  }
  if (typeof parsedState !== 'object') return

  updateRegistry(parsedState)
  return parsedState
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
  if (isDevToolsInitialized && isInspectorEnabled && !isDevToolsPaused) {
    devTools.send({ type: `${entity.name}:@@LAZY_INIT` }, mutableMap)
  }
}

export function onSet(entity: Entity, alias: string) {
  // Send new value to Inspector only if the update did not come from Inspector.
  if (alias === '@@DEVTOOLS') return

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

    // Capture the initial value of the registry so we can reset on demand.
    initialRegistryValue = { ...mutableMap }
  }

  // Notify Dev Tools of this update.
  if (!isDevToolsPaused) {
    devTools.send({ type: `${entity.name}:${alias}` }, mutableMap)
  }
}
