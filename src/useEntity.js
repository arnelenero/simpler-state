import { useState, useCallback, useEffect } from 'react'
import { strictEqual } from './utils'

const identity = v => v

export const useEntity = (
  entity,
  transform = identity,
  equality = strictEqual
) => {
  if (!(entity._subscribers instanceof Array))
    throw new Error('Invalid entity.')

  const computed = transform(entity._value)

  const [state, setState] = useState(computed)

  const subscriberFn = useCallback(
    newValue => {
      const newComputed = transform(newValue)
      const hasChanged = !equality(state, newComputed)
      if (hasChanged) setState(newComputed)
    },
    [transform, equality, state]
  )

  useEffect(() => {
    entity._subscribers.push(subscriberFn)
    return () => {
      for (let i = 0, c = entity._subscribers.length; i < c; i++) {
        if (entity._subscribers[i] === subscriberFn) {
          // Move the last subscriber over the removed one and pop it 
          entity._subscribers[i] = entity._subscribers[entity._subscribers.length - 1]
          entity._subscribers.pop()
          break
        }
      }
    }
  }, [subscriberFn, entity._subscribers])

  return computed
}

export default useEntity
