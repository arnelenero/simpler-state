import React from 'react'
import { mount } from 'enzyme'

import entity from '../entity'

describe('entity', () => {
  it('returns an entity object', () => {
    const counter = entity(0)
    expect(counter).toBeInstanceOf(Object)
  })

  it('requires an initial value in the argument', () => {
    expect(() => entity()).toThrow()
  })

  it('supports initial value of `null`', () => {
    expect(() => entity(null)).not.toThrow()
  })

  it('supports initial value of primitive type', () => {
    expect(() => entity(0)).not.toThrow()
    expect(() => entity('Hello')).not.toThrow()
    expect(() => entity(false)).not.toThrow()
  })

  it('sets the entity value to the initial value by default', () => {
    const counter = entity(0)
    expect(counter).toHaveProperty('_value', 0)
  })

  it('supports Promise for async initial value', async () => {
    const promise = new Promise(resolve =>
      setTimeout(() => {
        resolve(0)
      }, 1)
    )
    const counter = entity(promise)

    const inspect = () =>
      new Promise(resolve => {
        promise.then(value => {
          expect(value).toBe(0)
          expect(counter).toHaveProperty('_value', 0)
          resolve()
        })
      })
    await inspect()
  })

  it('keeps value undefined while waiting for async initial value', () => {
    const promise = new Promise(resolve =>
      setTimeout(() => {
        resolve(0)
      }, 1)
    )
    const counter = entity(promise)
    expect(counter).toHaveProperty('_value', undefined)
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

  it('provides a `use` hook function in the entity', () => {
    const counter = entity(0)
    expect(counter.use).toBeInstanceOf(Function)

    let count
    const CounterView = () => {
      count = counter.use()
      return <></>
    }
    const component = mount(<CounterView />)
    expect(count).toBe(0)

    component.unmount()
  })

  it('checks if the `plugins` argument (if any) is an array', () => {
    expect(() => entity(0, { persistence: true })).toThrow()
  })

  it('applies the `init` plug-in override (if any) to the entity', () => {
    let initCalls = 0
    const plugin = {
      init: (init, entity) => () => {
        init()
        initCalls++
      }
    }
    entity(0, [plugin])
    entity({ hello: 'world' }, [plugin])
    expect(initCalls).toBe(2)
  })

  it('applies the `set` plug-in override (if any) to the entity', () => {
    let setCalls = 0
    const plugin = {
      set: (set, entity) => (...args) => {
        set(...args)
        setCalls++
      }
    }
    const counter = entity(0, [plugin])
    const greeting = entity({ hello: 'world' }, [plugin])
    counter.set(1)
    greeting.set('wazzup')
    expect(setCalls).toBe(2)
  })

  it('attaches all plug-ins specified in the `plugins` argument', () => {
    let setCallsA = 0
    let setCallsB = 0
    const pluginA = {
      set: (set, entity) => (...args) => {
        set(...args)
        setCallsA++
      }
    }
    const pluginB = {
      set: (set, entity) => (...args) => {
        set(...args)
        setCallsB++
      }
    }
    const counter = entity(0, [pluginA, pluginB])
    counter.set(1)
    expect(setCallsA).toBe(1)
    expect(setCallsB).toBe(1)
  })

  it('checks if each item in the `plugins` argument is a plug-in object', () => {
    expect(() => {
      entity(0, [console.log])
    }).toThrow()
  })

  it('requires plug-in overrides to be specified via composer function, throws otherwise', () => {
    const plugin = {
      set: (set, ...args) => {
        set(...args)
      }
    }
    expect(() => {
      entity(0, [plugin])
    }).toThrow()
  })
})
