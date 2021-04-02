import persistence from '../persistence'
import entity from '../entity'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()

    sessionStorage.clear()
    sessionStorage.getItem.mockClear()
    sessionStorage.setItem.mockClear()
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
      persistence()
    }).toThrow()
  })

  it('fetches the persisted value by `key` upon entity initialization', () => {
    entity(0, [persistence('counter')])
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('persists the new value by `key` on every entity.set()', () => {
    const counter = entity(0, [persistence('counter')])
    setTimeout(() => {
      counter.set(1)
      expect(localStorage.setItem).toHaveBeenLastCalledWith('counter', '1')
    })
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
    const customStorage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    }
    entity(0, [persistence('counter', { storage: customStorage })])
    expect(customStorage.getItem).toHaveBeenLastCalledWith('counter')
    expect(localStorage.getItem).not.toHaveBeenCalled()
  })

  it('requires a custom storage to implement both `getItem` and `setItem`', () => {
    const customStorage = {
      setItem: jest.fn()
    }
    expect(() => {
      entity(0, [persistence('counter', { storage: customStorage })])
    }).toThrow()
  })

  it('supports a custom `serializeFn` when saving to storage', () => {
    let serialized = null
    const wrap = val => {
      return (serialized = { value: val })
    }
    entity(0, [persistence('counter', { serializeFn: wrap })])
    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'counter',
        serialized
      )
    })
  })

  it('supports a custom `deserializeFn` when fetching from storage', () => {
    localStorage.setItem('counter', '{"value":1}')
    const unwrap = val => val.value
    entity(0, [persistence('counter', { deserializeFn: unwrap })])
    setTimeout(() => {
      expect(entity.get()).toBe(1)
    })
  })

  it('warns if localStorage is not available but does not throw', () => {
    const origWarn = console.warn
    console.warn = jest.fn()
    const origLocalStorage = localStorage
    delete global._localStorage
    // emulate disabled localStorage
    Object.defineProperty(global, '_localStorage', {
      get: () => {
        throw new Error('Storage disabled')
      },
      configurable: true
    })

    expect(() => {
      entity(0, [persistence('counter')])
    }).not.toThrow()
    expect(console.warn).toHaveBeenCalled()

    delete global._localStorage
    Object.defineProperty(global, '_localStorage', {
      value: origLocalStorage,
      configurable: true,
      writable: false
    })
    console.warn = origWarn
  })

  it('warns if sessionStorage is not available but does not throw', () => {
    const origWarn = console.warn
    console.warn = jest.fn()
    const origSessionStorage = sessionStorage
    delete global._sessionStorage
    // emulate disabled sessionStorage
    Object.defineProperty(global, '_sessionStorage', {
      get: () => {
        throw new Error('Storage disabled')
      },
      configurable: true
    })

    expect(() => {
      entity(0, [persistence('counter', { storage: 'session' })])
    }).not.toThrow()
    expect(console.warn).toHaveBeenCalled()

    delete global._sessionStorage
    Object.defineProperty(global, '_sessionStorage', {
      value: origSessionStorage,
      configurable: true,
      writable: false
    })
    console.warn = origWarn
  })
})
