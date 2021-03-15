import { useEntity } from './useEntity'
import { store } from './store'
import { plugins } from './plugin'

export const entity = (initialValue, meta = {}) => {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  if (typeof meta !== 'object')
    throw new Error('Entity metadata should be an object.')

  const entity = {
    _value: undefined,
    _subscribers: []
  }
  entity.get = () => entity._value
  entity.set = createSetter(entity)
  entity.init = () => {
    entity.set(initialValue)
  }
  entity.use = createHook()

  applyPlugins(entity, meta)

  entity.init()

  // Save reference to this entity for use with useEntityBoundary hook
  store.push(entity)

  return entity
}

const createSetter = entity => (newValue, ...updaterArgs) => {
  if (typeof newValue === 'function')
    newValue = newValue(entity._value, ...updaterArgs)

  entity._value = newValue

  for (let i = 0; i < entity._subscribers.length; i++) {
    if (typeof entity._subscribers[i] === 'function')
      entity._subscribers[i](entity._value)
  }

  // Cleanup any nullified subscribers due to possible
  // component unmounts caused by this app state change
  entity._subscribers = entity._subscribers.filter(
    item => typeof item === 'function'
  )
}

const applyPlugins = (entity, meta) => {
  plugins.forEach(plugin => {
    const tapMethod = (method, tap, shouldIgnore) => {
      const ignore = typeof shouldIgnore === 'function' && shouldIgnore(meta)
      if (!ignore && typeof tap === 'function') {
        const func = entity[method]
        entity[method] = (...args) => {
          func(...args)
          tap(entity, meta)
        }
      }
    }

    tapMethod('init', plugin.onInit, plugin.shouldIgnoreInit)
    tapMethod('set', plugin.onSet, plugin.shouldIgnoreSet)
  })
}

const createHook = () => {
  return (...args) => useEntity(entity, ...args)
}

export default entity
