import { useEntity } from './useEntity'
import { store, isStoreEnabled } from './store'

export const entity = (initialValue, plugins = []) => {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  if (!(plugins instanceof Array)) throw new Error('Invalid plug-ins array.')

  const newEntity = {
    _value: undefined,
    _subscribers: new Set()
  }
  newEntity._subscribe = createSubscribe(newEntity)

  newEntity.get = () => newEntity._value
  newEntity.set = createSetter(newEntity)
  newEntity.init = createInit(newEntity, initialValue)
  newEntity.use = createHook(newEntity)

  applyPlugins(newEntity, plugins)

  newEntity.init()

  // Add this entity to store (if enabled) for use with `resetAll`
  if (isStoreEnabled()) store.add(newEntity)

  return newEntity
}

const createSetter =
  entity =>
  (newValue, ...updaterArgs) => {
    if (typeof newValue === 'function')
      newValue = newValue(entity._value, ...updaterArgs)

    entity._value = newValue

    entity._subscribers.forEach(cb => cb(entity._value))
  }

const createInit = (entity, initialValue) => {
  return initialValue && typeof initialValue.then === 'function'
    ? () => {
        // Call the setter so that any bound components are updated
        // The `setTimeout` is for preventing race conditions with subscriptions
        initialValue.then(value => setTimeout(() => entity.set(value)))
      }
    : () => {
        entity._value = initialValue
      }
}

const createHook = entity => {
  return (...args) => useEntity(entity, ...args)
}

const createSubscribe = entity => subscriberFn => {
  entity._subscribers.add(subscriberFn)
  return () => {
    entity._subscribers.delete(subscriberFn)
  }
}

export const applyPlugins = (entity, plugins) => {
  plugins.forEach(plugin => {
    if (typeof plugin !== 'object') throw new Error('Invalid plug-in')

    const overrideMethod = method => {
      if (typeof plugin[method] === 'function') {
        const override = plugin[method](entity[method], entity)
        if (typeof override !== 'function')
          throw new Error(`Invalid override for '${method}' in plug-in.`)
        entity[method] = override
      }
    }
    overrideMethod('init')
    overrideMethod('set')
  })
}

export default entity
