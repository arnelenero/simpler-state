import persistence from '../persistence'
import plugin from '../plugin'
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

  it('is in the correct plug-in format', () => {
    expect(() => {
      plugin(persistence)
    }).not.toThrow()
  })

  it('has ID `persistence`', () => {
    const pluginObj = persistence({})
    expect(pluginObj).toHaveProperty('id', 'persistence')
  })

  it('only applies to entities that have `persist: true` in their metadata', () => {
    plugin(persistence)
    entity(0)
    expect(localStorage.getItem).not.toHaveBeenCalled()
  })

  it('requires either `name` or `persistAs` in the entity metadata', () => {
    plugin(persistence)
    expect(() => {
      entity(0, { persist: true })
    }).toThrow()
  })

  it('fetches the persisted value by `name` upon entity initialization', () => {
    plugin(persistence)
    entity(0, { persist: true, name: 'counter', storage: localStorage })
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('can also fetch value by `persistAs` upon entity initialization', () => {
    plugin(persistence)
    entity(0, { persist: true, persistAs: 'counter', storage: localStorage })
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('persists the new value by `name` on every entity.set()', () => {
    plugin(persistence)
    const counter = entity(0, {
      persist: true,
      name: 'counter',
      storage: localStorage
    })
    setTimeout(() => {
      counter.set(1)
      expect(localStorage.setItem).toHaveBeenLastCalledWith('counter', '1')
    })
  })

  it('can also persist by `persistAs` on every entity.set()', () => {
    plugin(persistence)
    const counter = entity(0, {
      persist: true,
      persistAs: 'counter',
      storage: localStorage
    })
    setTimeout(() => {
      counter.set(1)
      expect(localStorage.setItem).toHaveBeenLastCalledWith('counter', '1')
    })
  })

  it('uses `localStorage` by default if no `storage` is found in entity metadata', () => {
    plugin(persistence)
    entity(0, { persist: true, name: 'counter' })
    expect(localStorage.getItem).toHaveBeenLastCalledWith('counter')
  })

  it('also supports `sessionStorage` in place of `localStorage`', () => {
    plugin(persistence)
    entity(0, { persist: true, name: 'counter', storage: sessionStorage })
    expect(sessionStorage.getItem).toHaveBeenLastCalledWith('counter')
    expect(localStorage.getItem).not.toHaveBeenCalled()
  })

  it('supports a custom `serializeFn` when saving to storage', () => {
    plugin(persistence)
    let serialized = null
    entity(0, {
      persist: true,
      name: 'counter',
      serializeFn: val => {
        return (serialized = { value: val })
      }
    })
    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'counter',
        serialized
      )
    })
  })

  it('supports a custom `deserializeFn` when fetching from storage', () => {
    plugin(persistence)
    localStorage.setItem('counter', '{ value: 1 }')
    entity(0, {
      persist: true,
      name: 'counter',
      deserializeFn: val => {
        return val.value
      }
    })
    setTimeout(() => {
      expect(entity).toHaveProperty('_value', 1)
    })
  })

  it('warns if storage is not available', () => {
    const origWarn = console.warn
    console.warn = jest.fn()
    const origLocalStorage = localStorage
    delete global._localStorage // emulate disabled localStorage

    plugin(persistence)
    entity(0, {
      persist: true,
      name: 'counter'
    })
    expect(console.warn).toHaveBeenCalled()

    Object.defineProperty(global, '_localStorage', {
      value: origLocalStorage,
      writable: false
    })
    console.warn = origWarn
  })
})
