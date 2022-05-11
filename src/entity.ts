import alias from './alias'
import { onInit, onSet } from './inspector'
import { getStore, isStoreEnabled } from './store'
import useEntity from './useEntity'

/**
 * An entity is the basic unit of shared state.
 */
export interface Entity<T = any> {
  /** Unique identifier for the entity */
  name: string

  /**
   * Sets the entity to its initial value.
   *
   * This is not normally invoked directly by the app, but can be
   * useful for unit testing.
   */
  init(): void

  /**
   * Gets the current value of the entity.
   *
   * @returns the entity value
   */
  get(): T

  /**
   * Updates the value of the entity.
   *
   * @param valueOrUpdaterFn - new value or an updater function
   * @param alias - optional name for the update
   */
  set(valueOrUpdaterFn: T | ((value: T) => T), alias?: string): void

  /**
   * Subscribes to entity updates, and returns an unsubscribe function.
   *
   * This is not normally invoked directly by a React component (use the
   * hook instead), but can be useful inside other functions.
   */
  subscribe(subscriberFn: (newValue: T) => any): () => void

  /**
   * Binds the entity value to component state. This is shorthand for the
   * `useEntity(thisEntity)` hook.
   *
   * @param transform - optional data transformation function
   * @param equality - optional custom equality function
   * @returns the current entity value
   */
  use<C = T>(transform?: (value: T) => C, equality?: (a: C, b: C) => boolean): C
}

/**
 * A plug-in extends the behavior of an entity by composing on top of its
 * original methods. Plug-ins can be stacked on top of another.
 */
export type Plugin = {
  [K in keyof Entity as Exclude<K, 'name'>]?: (
    origMethod: Entity[K],
    entity: Entity,
  ) => Entity[K]
}

/** Internal type for entity, for use by the builder only. */
interface EntityImpl<T = any> extends Partial<Entity<T>> {
  _value: T
  _subscribers: Set<(newValue: T) => any>
}

/**
 * Creates and returns a new entity.
 *
 * Initial value can be _any_ type, including primitives, but cannot be
 * explicitly `undefined` (prefer `null` for this).
 *
 * It can also be a `Promise` (unresolved, i.e. do not `await`), in which
 * case its value is implicitly `undefined` until the Promise resolves.
 *
 * @param initialValue - required default value
 * @param pluginsOrAlias - optional array list of plug-ins (or alias shorthand)
 * @returns the entity object
 */
function entity<T = any>(
  initialValue: T,
  pluginsOrAlias?: Plugin[] | string,
): Entity<T>

function entity<T = any>(
  initialValue: Promise<T>,
  pluginsOrAlias?: Plugin[] | string,
): Entity<T | undefined>

function entity(
  initialValue: any,
  pluginsOrAlias: Plugin[] | string = [],
): Entity {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  // If alias string is specified, use the built-in `alias` plug-in.
  const plugins =
    typeof pluginsOrAlias === 'string'
      ? [alias(pluginsOrAlias)]
      : pluginsOrAlias

  if (!(plugins instanceof Array)) throw new Error('Invalid plug-ins array.')

  const entityBuild: EntityImpl = {
    _value: undefined,
    _subscribers: new Set(),
  }

  entityBuild.subscribe = createSubscribe(entityBuild)
  entityBuild.get = createGet(entityBuild)
  entityBuild.set = createSet(entityBuild)
  entityBuild.init = createInit(entityBuild, initialValue)
  entityBuild.use = createHook(entityBuild)

  const newEntity = entityBuild as Entity

  applyPlugins(newEntity, plugins)

  newEntity.init()

  // Add this entity to store (if enabled) for use with `resetAll()`.
  if (isStoreEnabled()) getStore().add(newEntity)

  return newEntity
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
  return (valueOrUpdaterFn, alias) => {
    // Evaluate if new value is passed as updater function.
    if (typeof valueOrUpdaterFn === 'function')
      valueOrUpdaterFn = valueOrUpdaterFn(entity._value)

    entity._value = valueOrUpdaterFn

    entity._subscribers.forEach(cb => cb(entity._value))

    // Send new value to Inspector only if the update did not come from Inspector.
    if (alias !== '@@DEVTOOLS') onSet(entity as Entity, alias ?? '<anonymous>')
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

    onInit(entity as Entity)
  }
}

function createHook(entity: EntityImpl): Entity['use'] {
  return (...args: any[]) => useEntity(entity as Entity, ...args)
}

function applyPlugins(entity: Entity, plugins: Plugin[]) {
  plugins.forEach(plugin => {
    if (typeof plugin !== 'object') throw new Error('Invalid plug-in')

    function overrideMethod(method: keyof Plugin) {
      const createOverride = plugin[method]
      if (typeof createOverride === 'function') {
        const override = createOverride(entity[method] as any, entity)
        if (typeof override !== 'function')
          throw new Error(`Invalid override for '${method}' in plug-in.`)
        entity[method] = override as any
      }
    }

    Object.keys(plugin).forEach(method =>
      overrideMethod(method as keyof Plugin),
    )
  })
}
