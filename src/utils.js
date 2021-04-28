/* Basic equality functions */

export const strictEqual = (a, b) => a === b

export const shallowEqual = (a, b) =>
  strictEqual(a, b) || (bothObjects(a, b) && equalProps(a, b))

const bothObjects = (a, b) =>
  typeof a === 'object' && a !== null && typeof b === 'object' && b !== null

const equalProps = (a, b) => {
  const keysOfA = Object.keys(a)
  const keysOfB = Object.keys(b)
  if (keysOfA.length !== keysOfB.length) return false
  for (let i = 0; i < keysOfA.length; i++) {
    const key = keysOfA[i]
    if (!b.hasOwnProperty(key) || a[key] !== b[key]) return false
  }
  return true
}

/* Client-side vs. server-side rendering detection */

export const isClientDetected = () => {
  const canUseDOM = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )

  const canUseNative =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

  return canUseDOM || canUseNative
}

const isClient = isClientDetected()
let fakeSSR = false

export const isClientSide = () => isClient && !fakeSSR

export const emulateSSR = () => {
  fakeSSR = true
}

export const clearSSR = () => {
  fakeSSR = false
}
