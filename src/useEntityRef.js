import { useRef, useCallback, useEffect } from 'react'

const identity = v => v

export const useEntityRef = (entity, transform = identity) => {
  if (!(entity._subscribers instanceof Set)) throw new Error('Invalid entity.')

  const ref = useRef(null)

  const subscriberFn = useCallback(
    newValue => {
      const newComputed = transform(newValue)
      ref.current = newComputed
    },
    [transform]
  )

  useEffect(() => entity._subscribe(subscriberFn), [subscriberFn, entity])

  // Re-sync ref in case the transform function has changed
  subscriberFn(entity._value)

  return ref
}

export default useEntityRef
