import { store } from './store'

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

export const entity = initialValue => {
  if (initialValue === undefined)
    throw new Error('Entity requires an initial value.')

  const entity = {
    _value: initialValue,
    _initialValue: initialValue,
    _subscribers: []
  }
  entity.get = () => entity._value
  entity.set = createSetter(entity)

  // Save reference to this entity for use with useEntityBoundary hook
  store.push(entity)

  return entity
}

export default entity
