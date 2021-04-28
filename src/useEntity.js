import { useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { strictEqual, isClientSide } from './utils'

const identity = v => v

export const useEntity = (
  entity,
  transform = identity,
  equality = strictEqual
) => {
  if (!(entity._subscribers instanceof Set)) throw new Error('Invalid entity.')

  const [state, setState] = useState(transform(entity._value))

  const subscriberFn = useCallback(
    newValue => {
      const newComputed = transform(newValue)
      const hasChanged = !equality(state, newComputed)
      if (hasChanged) setState(newComputed)
    },
    [transform, equality, state]
  )

  const useIsoEffect = isClientSide() ? useLayoutEffect : useEffect
  useIsoEffect(() => entity._subscribe(subscriberFn), [subscriberFn, entity])

  // Re-sync state in case transform function has changed
  subscriberFn(entity._value)

  return state
}

export default useEntity
