/**
 * Checks if two values are referentially equal.
 *
 * @param a - first value to compare
 * @param b - second value to compare
 * @returns true/false
 */
export function strictEqual(a: any, b: any) {
  return a === b
}

/**
 * Checks if two objects have equal properties, regardless of whether the
 * objects themselves are referentially equal.
 *
 * @param a - first object to compare
 * @param b - second object to compare
 * @returns true/false
 */
export function shallowEqual(a: any, b: any) {
  return strictEqual(a, b) || (bothObjects(a, b) && equalProps(a, b))
}

function bothObjects(a: any, b: any) {
  return (
    typeof a === 'object' && a !== null && typeof b === 'object' && b !== null
  )
}

function equalProps(a: any, b: any) {
  const keysOfA = Object.keys(a)
  const keysOfB = Object.keys(b)

  if (keysOfA.length !== keysOfB.length) return false

  for (let i = 0; i < keysOfA.length; i++) {
    const key = keysOfA[i]
    if (!b.hasOwnProperty(key) || a[key] !== b[key]) return false
  }

  return true
}
