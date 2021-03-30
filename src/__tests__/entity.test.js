import React from 'react'
import { mount } from 'enzyme'

import entity from '../entity'
import { plugins } from '../plugin'

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

  it('supports Promise for async initial value', async () => {
    const promise = new Promise(resolve =>
      setTimeout(() => {
        resolve(0)
      }, 1)
    )
    const counter = entity(promise)

    // We need to await this to include it in coverage
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

  it('checks if the `meta` argument (if any) is an object', () => {
    expect(() => entity(0, true)).toThrow()
  })

  it('applies the `init` plug-in override (if any) to the entity', () => {
    let initCalls = 0
    plugins.push({
      id: 'test',
      init: (init, entity, meta) => () => {
        init()
        initCalls++
      }
    })
    entity(0)
    entity({ hello: 'world' })
    expect(initCalls).toBe(2)

    plugins.pop()
  })

  it('applies the `set` plug-in override (if any) to the entity', () => {
    let setCalls = 0
    plugins.push({
      id: 'test',
      set: (set, entity, meta) => (...args) => {
        set(...args)
        setCalls++
      }
    })
    const counter = entity(0)
    const greeting = entity({ hello: 'world' })
    counter.set(1)
    greeting.set('wazzup')
    // note: `set` is also called automatically on init!
    expect(setCalls).toBe(4)

    plugins.pop()
  })

  it('requires plug-in overrides to be specified via composer function, throws otherwise', () => {
    plugins.push({
      id: 'test',
      set: (set, ...args) => {
        set(...args)
      }
    })

    expect(() => {
      entity(0)
    }).toThrow()

    plugins.pop()
  })
})
