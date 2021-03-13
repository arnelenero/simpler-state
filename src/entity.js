import { store } from './store'
import { plugins } from './plugin'

export const entity = (initialValue, meta = {}) => {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  const entity = {
    _value: undefined,
    _subscribers: []
  }
  entity.get = () => entity._value
  entity.set = createSetter(entity)
  entity.init = () => {
    entity.set(initialValue)
  }

  applyPlugins(entity, meta)

  entity.init()

  // Save reference to this entity for use with useEntityBoundary hook
  store.push(entity)

  return entity
}

export const createSetter = entity => (newValue, ...updaterArgs) => {
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

export const applyPlugins = (entity, meta) => {
  plugins.forEach(plugin => {
    if (typeof plugin.onInit === 'function') {
      let init = entity.init
      entity.init = () => {
        init()
        plugin.onInit(entity, meta)
      }
    }
    if (typeof plugin.onSet === 'function') {
      let set = entity.set
      entity.set = (...args) => {
        set(...args)
        plugin.onSet(entity, meta)
      }
    }
  })
}

export default entity
