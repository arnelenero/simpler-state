import entity from '../entity'

describe('entity', () => {
  it('returns an entity object', () => {
    const counter = entity(0)
    expect(counter).toBeInstanceOf(Object)
  })

  it('requires an initial value in the argument', () => {
    expect(() => entity()).toThrow()
  })

  it('sets the entity value to the initial value by default', () => {
    const counter = entity(0)
    expect(counter).toHaveProperty('_value', 0)
  })

  it('provides a `get` function in the entity', () => {
    const counter = entity(0)
    expect(counter.get).toBeInstanceOf(Function)
  })

  it('enables `get` to return the current value of the entity', () => {
    const counter = entity(0)
    const count = counter.get()
    expect(count).toBe(0)
  })

  it('provides a `set` function in the entity', () => {
    const counter = entity(0)
    expect(counter.set).toBeInstanceOf(Function)
  })

  it('enables `set` to change the entity value', () => {
    const counter = entity(0)
    counter.set(1)
    expect(counter).toHaveProperty('_value', 1)
  })

  it('supports passing an updater function to `set`', () => {
    const counter = entity(0)
    const increment = (val, by) => val + by
    counter.set(increment, 2)
    expect(counter).toHaveProperty('_value', 2)
  })

  it('supports multiple arguments to the updater function', () => {
    const counter = entity(0)
    const adjust = (val, upBy, downBy) => val + upBy - downBy
    counter.set(adjust, 5, 3)
    expect(counter).toHaveProperty('_value', 2)
  })

  it('provides an `init` function in the entity', () => {
    const counter = entity(0)
    expect(counter.init).toBeInstanceOf(Function)
  })

  it('enables `init` to reset the entity to its initial value', () => {
    const counter = entity(0)
    counter.set(2)
    counter.init()
    expect(counter).toHaveProperty('_value', 0)
  })
})
