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
