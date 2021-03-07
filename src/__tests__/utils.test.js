import { strictEqual, shallowEqual } from '../utils'

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
