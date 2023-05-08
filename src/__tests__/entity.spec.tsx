import React from 'react'
import { render } from '@testing-library/react'

import { entity } from '../entity'
import { enableInspector } from '../tools/inspector'
import { getStore, enableStore } from '../tools/store'

import type { Plugin } from '../entity'

describe('entity', () => {
  it('returns an entity object', () => {
    const counter = entity(0)
    expect(counter).toBeInstanceOf(Object)
  })

  it('requires an initial value in the argument', () => {
    // @ts-ignore
    expect(() => entity()).toThrow()
  })

  it('throws if initial value is explicitly `undefined`', () => {
    expect(() => entity(undefined)).toThrow()
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

  /*** Async initial value ***/

  it('supports Promise for async initial value', async () => {
    const counter = entity(Promise.resolve(10))

    const inspect = () =>
      new Promise<void>(resolve => {
        setTimeout(() => {
          expect(counter).toHaveProperty('_value', 10)
          resolve()
        }, 10)
      })
    await inspect()
  })

  it('keeps value `undefined` while waiting for async initial value', () => {
    const counter = entity(Promise.resolve(0))
    expect(counter).toHaveProperty('_value', undefined)
  })

  /*** Entity name/alias ***/

  it('sets the entity name to the optional alias passed as argument', () => {
    const counter = entity(0, 'counter')
    expect(counter.name).toBe('counter')
  })

  it('sets a default entity name `entity` suffixed by incremental number', () => {
    const counter = entity(0)
    expect(counter.name.indexOf('entity')).toBe(0)
  })

  /*** Entity methods ***/

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
    counter.set(val => val + 2)
    expect(counter).toHaveProperty('_value', 2)
  })

  it('accepts an update alias that is visible to the (optional) Inspector', () => {
    const counter = entity(0)
    counter.set(val => val + 1, 'increment')
    expect(counter).toHaveProperty('_value', 1)
  })

  it('accepts a special update alias `@@DEVTOOLS`', () => {
    const counter = entity(0)
    counter.set(1, '@@DEVTOOLS')
    expect(counter).toHaveProperty('_value', 1)
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

    let count: number | null = null
    const CounterView = () => {
      count = counter.use()
      return <></>
    }
    const { unmount } = render(<CounterView />)
    expect(count).toBe(0)

    unmount()
  })

  /*** Plug-in support ***/

  it('checks if the `plugins` argument (if any) is an array', () => {
    // @ts-ignore
    expect(() => entity(0, { persistence: true })).toThrow()
  })

  it('applies the `init` plug-in override (if any) to the entity', () => {
    let initCalls = 0
    const plugin: Plugin = {
      init: origInit => () => {
        origInit()
        initCalls++
      },
    }
    entity(0, [plugin])
    entity({ hello: 'world' }, [plugin])
    expect(initCalls).toBe(2)
  })

  it('applies the `set` plug-in override (if any) to the entity', () => {
    let setCalls = 0
    const plugin: Plugin = {
      set:
        origSet =>
        (...args) => {
          origSet(...args)
          setCalls++
        },
    }
    const counter = entity(0, [plugin])
    const greeting = entity({ hello: 'world' }, [plugin])
    counter.set(1)
    greeting.set({ hello: 'wazzup' })
    expect(setCalls).toBe(2)
  })

  it('attaches all plug-ins specified in the `plugins` argument', () => {
    let setCallsA = 0
    let setCallsB = 0
    const pluginA: Plugin = {
      set:
        origSet =>
        (...args) => {
          origSet(...args)
          setCallsA++
        },
    }
    const pluginB: Plugin = {
      set:
        origSet =>
        (...args) => {
          origSet(...args)
          setCallsB++
        },
    }
    const counter = entity(0, [pluginA, pluginB])
    counter.set(1)
    expect(setCallsA).toBe(1)
    expect(setCallsB).toBe(1)
  })

  it('checks if each item in the `plugins` argument is a plug-in object', () => {
    expect(() => {
      // @ts-ignore
      entity(0, [console.log])
    }).toThrow()
  })

  it('requires plug-in overrides to be specified via composer function, throws otherwise', () => {
    const plugin: Plugin = {
      // @ts-ignore
      set: (origSet, ...args) => {},
    }
    expect(() => {
      entity(0, [plugin])
    }).toThrow()
  })

  /*** Developer tools and testing ***/

  it('adds the entity to store if enabled', () => {
    enableStore()

    const counter = entity(0)
    const addedToStore = getStore().has(counter)
    expect(addedToStore).toBe(true)
  })

  it('does not add the entity to store if not enabled', () => {
    enableStore(false)

    const counter = entity(0)
    const addedToStore = getStore().has(counter)
    expect(addedToStore).toBe(false)
  })

  it('supports Inspector if enabled', () => {
    enableInspector()
    const origInspector = window.__inspector
    window.__inspector = {
      onInit: jest.fn((...args) => origInspector?.onInit(...args)),
      onSet: jest.fn((...args) => origInspector?.onSet(...args)),
    }

    const counter = entity(0)
    expect(window.__inspector.onInit).toHaveBeenCalled()

    counter.set(1)
    expect(window.__inspector.onSet).toHaveBeenCalled()
  })
})
