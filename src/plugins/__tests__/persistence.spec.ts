import persistence from '../persistence'
import entity from '../../core/entity'

import type { AsyncStorage, Storage } from '../persistence'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    ;(localStorage.getItem as jest.Mock).mockClear()
    ;(localStorage.setItem as jest.Mock).mockClear()

    sessionStorage.clear()
    ;(sessionStorage.getItem as jest.Mock).mockClear()
    ;(sessionStorage.setItem as jest.Mock).mockClear()
  })

  it('comes as a function that returns the plug-in', () => {
    expect(persistence).toBeInstanceOf(Function)

    const plugin = persistence('counter')
    expect(plugin).toBeInstanceOf(Object)
  })

  it('provides override for entity.init()', () => {
    const plugin = persistence('counter')
    expect(plugin).toHaveProperty('init')
  })

  it('provides override for entity.set()', () => {
    const plugin = persistence('counter')
    expect(plugin).toHaveProperty('set')
  })

  it('requires a `key` as its first argument', () => {
    expect(() => {
      // @ts-ignore
      persistence()
    }).toThrow()
  })

  it('fetches the persisted value by `key` upon entity initialization', () => {
    entity(0, [persistence('counter')])
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('sets the fetched value as current value', () => {
    localStorage.setItem('counter', '1')
    const counter = entity(0, [persistence('counter')])
    expect(counter.get()).toBe(1)
  })

  it('persists the new value by `key` on every entity.set()', () => {
    const counter = entity(0, [persistence('counter')])
    counter.set(1)
    expect(localStorage.setItem).toHaveBeenLastCalledWith('counter', '1')
  })

  it('uses localStorage by default if no `storage` is specified in options', () => {
    entity(0, [persistence('counter')])
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('uses localStorage when `storage` option is set to "local"', () => {
    entity(0, [persistence('counter', { storage: 'local' })])
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('uses sessionStorage when `storage` option is set to "session"', () => {
    entity(0, [persistence('counter', { storage: 'session' })])
    expect(sessionStorage.getItem).toHaveBeenLastCalledWith('counter')
    expect(localStorage.getItem).not.toHaveBeenCalled()
  })

  it('supports custom storage', () => {
    const customStorage: Storage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
    }
    entity(0, [persistence('counter', { storage: customStorage })])
    expect(customStorage.getItem).toHaveBeenLastCalledWith('counter')
    expect(localStorage.getItem).not.toHaveBeenCalled()
  })

  it('supports custom storage with async methods', async () => {
    const customStorage: AsyncStorage = {
      getItem: key => new Promise(resolve => resolve('10')),
      setItem: (key, value) => new Promise(resolve => resolve()),
    }
    const counter = entity(0, [
      persistence('counter', { storage: customStorage }),
    ])
    await inspectAfterTimeout(() => {
      expect(counter.get()).toBe(10)
    })
  })

  it('requires a custom storage to implement both `getItem` and `setItem`', () => {
    // @ts-ignore
    const customStorage: AsyncStorage = {
      setItem: jest.fn(),
    }
    expect(() => {
      entity(0, [persistence('counter', { storage: customStorage })])
    }).toThrow()
  })

  it('supports a custom `serializeFn` when saving to storage', () => {
    let serialized = ''
    const wrap = (val: any) => {
      return (serialized = JSON.stringify({ value: val }))
    }
    const counter = entity(0, [persistence('counter', { serializeFn: wrap })])
    counter.set(1)
    expect(localStorage.setItem).toHaveBeenLastCalledWith('counter', serialized)
  })

  it('supports async custom `serializeFn`', async () => {
    let serialized = ''
    const wrap = (val: any) =>
      new Promise<string>(resolve => {
        resolve((serialized = JSON.stringify({ value: val })))
      })
    const counter = entity(0, [persistence('counter', { serializeFn: wrap })])
    counter.set(1)
    await inspectAfterTimeout(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'counter',
        serialized,
      )
    })
  })

  it('supports a custom `deserializeFn` when fetching from storage', () => {
    localStorage.setItem('counter', '{"value":1}')
    const unwrap = (val: string) => JSON.parse(val).value
    const counter = entity(0, [
      persistence('counter', { deserializeFn: unwrap }),
    ])
    expect(counter.get()).toBe(1)
  })

  it('supports async custom `deserializeFn`', async () => {
    localStorage.setItem('counter', '{"value":1}')
    const unwrap = (val: string) =>
      new Promise(resolve => resolve(JSON.parse(val).value))
    const counter = entity(0, [
      persistence('counter', { deserializeFn: unwrap }),
    ])
    await inspectAfterTimeout(() => {
      expect(counter.get()).toBe(1)
    })
  })

  it('does not set entity value if async `getItem` resolves to null', async () => {
    const customStorage: AsyncStorage = {
      getItem: key => new Promise(resolve => resolve(null)),
      setItem: jest.fn(),
    }
    const counter = entity(0, [
      persistence('counter', { storage: customStorage }),
    ])
    await inspectAfterTimeout(() => {
      expect(customStorage.setItem).not.toHaveBeenCalled()
      expect(counter.get()).toBe(0)
    })
  })

  it('warns if localStorage is not available but does not throw', () => {
    const origWarn = console.warn
    console.warn = jest.fn()
    const origLocalStorage = localStorage
    // @ts-ignore
    delete global._localStorage
    // emulate disabled localStorage
    Object.defineProperty(global, '_localStorage', {
      get: () => {
        throw new Error('Storage disabled')
      },
      configurable: true,
    })

    expect(() => {
      entity(0, [persistence('counter')])
    }).not.toThrow()
    expect(console.warn).toHaveBeenCalled()

    // @ts-ignore
    delete global._localStorage
    Object.defineProperty(global, '_localStorage', {
      value: origLocalStorage,
      configurable: true,
      writable: false,
    })
    console.warn = origWarn
  })

  it('warns if sessionStorage is not available but does not throw', () => {
    const origWarn = console.warn
    console.warn = jest.fn()
    const origSessionStorage = sessionStorage
    // @ts-ignore
    delete global._sessionStorage
    // emulate disabled sessionStorage
    Object.defineProperty(global, '_sessionStorage', {
      get: () => {
        throw new Error('Storage disabled')
      },
      configurable: true,
    })

    expect(() => {
      entity(0, [persistence('counter', { storage: 'session' })])
    }).not.toThrow()
    expect(console.warn).toHaveBeenCalled()

    // @ts-ignore
    delete global._sessionStorage
    Object.defineProperty(global, '_sessionStorage', {
      value: origSessionStorage,
      configurable: true,
      writable: false,
    })
    console.warn = origWarn
  })
})

const inspectAfterTimeout = (inspect: () => void, timeout = 5) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      inspect()
      resolve()
    }, timeout)
  })
