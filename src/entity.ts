import alias from './alias'
import inspector from './inspector'

import type { EntityHook } from './useEntity'

/**
 * An entity is the basic unit of shared state.
 */
export interface Entity<T = any> {
  name: string

  /** Sets the entity to its initial value. */
  init(): void

  /** Returns the current value of the entity. */
  get(): T

  /** Updates the value of the entity. */
  set: {
    (newValue: T, alias?: string): void
    (updaterFn: (value: T) => T, alias?: string): void
  }

  /** Subscribes to entity updates, and returns unsubscribe function. */
  subscribe(subscriberFn: (newValue: T) => any): () => void

  /** Binds the entity value to component state. */
  use: EntityHook<T>
}

/**
 * A plug-in extends the behavior of an entity by composing
 * on top of its original `init` and `set` methods.
 */
export interface Plugin {
  /**
   * Returns an override for the entity's `init` method.
   *
   * @param origSet - original `init`
   * @param entity - target entity
   */
  init?: (origInit: Entity['init'], entity: Entity) => Entity['init']

  /**
   * Returns an override for the entity's `set` method.
   *
   * @param origSet - original `set`
   * @param entity - target entity
   */
  set?: (origSet: Entity['set'], entity: Entity) => Entity['set']
}

/** Internal type for entity, for use by the builder only. */
interface EntityImpl<T = any> extends Partial<Entity<T>> {
  _value: T
  _subscribers: Set<(newValue: T) => any>
}

/**
 * Creates and returns a new entity.
 *
 * Initial value can be _any_ type, including primitives. It can also be
 * a `Promise` (unresolved, a.k.a. do not `await`).
 *
 * @param initialValue - required default value
 * @param pluginsOrAlias - optional array list of plug-ins (or alias shorthand)
 * @returns the entity
 */
function entity<T = any>(
  initialValue: T,
  pluginsOrAlias?: Plugin[] | string,
): Entity<T>

function entity<T = any>(
  initialValue: Promise<T>,
  pluginsOrAlias?: Plugin[] | string,
): Entity<T | undefined>

function entity(initialValue: any, pluginsOrAlias?: Plugin[] | string): Entity {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  // If alias string is specified, use the `alias` plug-in.
  if (typeof pluginsOrAlias === 'string')
    pluginsOrAlias = [alias(pluginsOrAlias)]

  if (!(pluginsOrAlias instanceof Array))
    throw new Error('Invalid plug-ins array.')

  const newEntity: EntityImpl = {
    _value: undefined,
    _subscribers: new Set(),
  }

  newEntity.subscribe = createSubscribe(newEntity)
  newEntity.get = createGet(newEntity)
  newEntity.set = createSet(newEntity)
  newEntity.init = createInit(newEntity, initialValue)
  newEntity.use = createHook(newEntity)

  applyPlugins(newEntity, plugins)

  newEntity.init()

  // Add this entity to store (if enabled) for use with `resetAll`
  // TODO: Move this to init()
  if (isStoreEnabled()) store.add(newEntity)

  return newEntity as Entity
}

export default entity

function createSubscribe(entity: EntityImpl): Entity['subscribe'] {
  return subscriberFn => {
    entity._subscribers.add(subscriberFn)

    // Return the corresponding unsubscribe function.
    return () => {
      entity._subscribers.delete(subscriberFn)
    }
  }
}

function createGet(entity: EntityImpl): Entity['get'] {
  return () => entity._value
}

function createSet(entity: EntityImpl): Entity['set'] {
  return (newValue, alias) => {
    // Evaluate if `newValue` is a function.
    if (typeof newValue === 'function') newValue = newValue(entity._value)

    entity._value = newValue

    entity._subscribers.forEach(cb => cb(entity._value))

    // Send new value to Inspector only if the update did not come from Inspector.
    if (alias !== '@@DEVTOOLS')
      inspector.onSet?.(entity, alias ?? '<anonymous>')
  }
}

let nextId = 1

function createInit(entity: EntityImpl, initialValue: any): Entity['init'] {
  return () => {
    // Assign a sequential ID if no alias is provided.
    if (!entity.name) entity.name = `entity${nextId++}`

    if (initialValue instanceof Promise)
      // Call the setter so that any bound components are updated.
      // The `setTimeout` is for preventing race conditions with subscriptions.
      initialValue.then((value: any) =>
        setTimeout(() => entity.set!(value, '@@ASYNC_INIT')),
      )
    else entity._value = initialValue

    inspector.onInit?.(entity)
  }
}
