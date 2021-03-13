import { store } from './store'
import { plugins } from './plugin'

export const entity = (initialValue, options = {}) => {
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

  applyPlugins(entity, options)

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

export const applyPlugins = (entity, options) => {
  plugins.forEach(plugin => {
    if (typeof plugin.onCreate === 'function') {
      plugin.onCreate(options)
    }
    if (typeof plugin.onChange === 'function') {
      let set = entity.set
      entity.set = (...args) => {
        const before = entity._value
        set(...args)
        const after = entity._value
        plugin.onChange(before, after, options)
      }
    }
  })
}

export default entity
