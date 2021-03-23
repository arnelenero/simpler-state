import { useState, useCallback, useEffect } from 'react'
import { strictEqual } from './utils'

const identity = v => v

export const useEntity = (
  entity,
  transform = identity,
  equality = strictEqual
) => {
  if (!(entity._subscribers instanceof Set)) throw new Error('Invalid entity.')

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
    entity._subscribers.add(subscriberFn)
    return () => {
      entity._subscribers.delete(subscriberFn)
    }
  }, [subscriberFn, entity._subscribers])

  return computed
}

export default useEntity
