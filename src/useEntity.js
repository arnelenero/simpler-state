import { useState, useCallback, useEffect } from 'react'
import { strictEqual } from './utils'

export const useEntity = (
  entity,
  { transform = v => v, equality = strictEqual } = {}
) => {
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
          entity._subscribers[i] = null
          break
        }
      }
    }
  }, [subscriberFn, entity._subscribers])

  return computed
}

export default useEntity
