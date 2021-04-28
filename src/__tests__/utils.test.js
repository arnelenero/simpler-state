import { strictEqual, shallowEqual, isClientDetected } from '../utils'

describe('strictEqual', () => {
  it('returns true when references to the same object are passed', () => {
    const a = { id: 1 }
    const b = a
    const equal = strictEqual(a, b)
    expect(equal).toBe(true)
  })
})

describe('strictEqual', () => {
  it('returns false when given 2 different objects even if their props are equal', () => {
    const a = { id: 1 }
    const b = { id: 1 }
    const equal = strictEqual(a, b)
    expect(equal).toBe(false)
  })
})

describe('shallowEqual', () => {
  it('returns true if the 2 different objects have exactly the same props', () => {
    const a = { id: 1 }
    const b = { id: 1 }
    const equal = shallowEqual(a, b)
    expect(equal).toBe(true)
  })
})

describe('shallowEqual', () => {
  it('returns false if the 2 objects have props that are not strictly equal, i.e. `!==`', () => {
    const a = { id: 1 }
    const b = { id: '1' }
    const equal = shallowEqual(a, b)
    expect(equal).toBe(false)
  })
})

describe('shallowEqual', () => {
  it('returns true if the references point to the same object', () => {
    const a = { id: 1 }
    const b = a
    const equal = shallowEqual(a, b)
    expect(equal).toBe(true)
  })
})

describe('shallowEqual', () => {
  it('returns false if one of the objects has props that are not present on the other', () => {
    const a = { id: 1 }
    const b = { id: 1, extra: true }
    const c = { id: 1, differentExtra: true }
    const equalAB = shallowEqual(a, b)
    expect(equalAB).toBe(false)
    const equalBC = shallowEqual(b, c)
    expect(equalBC).toBe(false)
  })
})

describe('isClientDetected', () => {
  it('returns true if running on a browser', () => {
    // Assert to ensure Jest is running with JSDom
    expect(window).toBeDefined()
    expect(window.document).toBeDefined()

    const isClient = isClientDetected()
    expect(isClient).toBe(true)
  })

  it('returns true if running on React Native', () => {
    const originalDocument = global.document
    delete global.document
    emulateRN()

    // Assert to ensure React Native is emulated properly
    expect(navigator).toBeDefined()
    expect(navigator.product).toBe('ReactNative')

    const isClient = isClientDetected()
    expect(isClient).toBe(true)

    clearRN()
    global.document = originalDocument
  })

  it('returns false if running on server', () => {
    const originalDocument = global.document
    delete global.document

    // Assert to ensure `window.document` has been removed
    expect(window.document).not.toBeDefined()

    const isClient = isClientDetected()
    expect(isClient).toBe(false)

    global.document = originalDocument
  })
})

/* Utility: Emulate React Native */
const originalProduct = global.navigator && global.navigator.product
let product = originalProduct
Object.defineProperty(global.navigator, 'product', {
  get() {
    return product
  }
})
export const clearRN = () => {
  product = originalProduct
}
export const emulateRN = () => {
  product = 'ReactNative'
}
