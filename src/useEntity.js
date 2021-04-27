import { useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { strictEqual } from './utils'

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

  useIsoEffect(() => entity._subscribe(subscriberFn), [subscriberFn, entity])

  // Re-sync state in case transform function has changed
  subscriberFn(entity._value)

  return state
}

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

const canUseNative =
  typeof navigator != 'undefined' && navigator.product === 'ReactNative'

const useIsoEffect = canUseDOM || canUseNative ? useLayoutEffect : useEffect

export default useEntity
