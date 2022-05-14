import { enableInspector, initInspector, onInit, onSet } from '../inspector'
import { getMutableMap, updateRegistry } from '../registry'

import type { Entity } from '../entity'

describe('inspector', () => {
  let origExt: any
  let isDevToolsEnabled = true
  let onDevToolsEvent: ((event: any) => void) | null
  let lastDevToolsEvent: any = null

  const connection = {
    init: jest.fn((state: Record<string, any>) => {}),
    send: jest.fn((event: { type: string }, state: Record<string, any>) => {
      lastDevToolsEvent = event
    }),
    subscribe: jest.fn((callback: (event: any) => void) => {
      onDevToolsEvent = callback
    }),
  }

  const ext = {
    connect: jest.fn(() => {
      return connection
    }),
  }

  function mockDevTools() {
    origExt = window.__REDUX_DEVTOOLS_EXTENSION__
    window.__REDUX_DEVTOOLS_EXTENSION__ = ext
  }

  function unmockDevTools() {
    window.__REDUX_DEVTOOLS_EXTENSION__ = origExt
  }

  function enableDevTools(enabled = true) {
    isDevToolsEnabled = enabled
    window.__REDUX_DEVTOOLS_EXTENSION__ = isDevToolsEnabled ? ext : undefined
  }

  function mockEntity(initialValue: any, name?: string) {
    let _value = initialValue
    return {
      name: name ?? 'entity0',
      get: jest.fn(() => _value),
      set: jest.fn(value => (_value = value)),
    } as any as Entity
  }

  beforeAll(mockDevTools)
  afterAll(unmockDevTools)

  describe('onInit', () => {
    beforeEach(() => {
      ext.connect.mockClear()
    })

    it('does not proceed if entity is private', () => {
      onInit(mockEntity(0, '_privateFoo'))
      expect(ext.connect).not.toHaveBeenCalled()
    })

    it('initializes Inspector on first invocation only', () => {
      onInit(mockEntity(0))
      onInit(mockEntity(0))
      expect(ext.connect).toHaveBeenCalledTimes(1)
    })

    it('subscribes the entity to updates in the registry value', () => {
      enableInspector()
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      updateRegistry({ counter: 1 })

      expect(counter.get()).toBe(1)
    })

    it('restricts subscription to update the entity only if Inspector is enabled', () => {
      enableInspector(false)
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      updateRegistry({ counter: 1 })

      expect(counter.get()).toBe(0)
    })

    it('saves the initial value of the entity to the registry', () => {
      onInit(mockEntity(0, 'counter'))

      expect(getMutableMap()).toHaveProperty('counter', 0)
    })

    it('notifies Dev Tools of any lazy-initialized entity', () => {
      enableInspector()
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      onSet(counter, 'counter') // this triggers Dev Tools initialization
      onInit(mockEntity(null, 'foo'))

      expect(lastDevToolsEvent).toHaveProperty('type', 'foo:@@LAZY_INIT')
    })
  })

  describe('initInspector', () => {
    document.title = 'Test'

    beforeEach(() => {
      ext.connect.mockClear()
      onDevToolsEvent = null
    })

    it('connects to Dev Tools, setting name to document title', () => {
      initInspector()
      expect(ext.connect).toHaveBeenCalledWith({ name: 'Test' })
    })

    it('initializes the registry', () => {
      initInspector()
      expect(getMutableMap()).toEqual({})
    })

    it('subscribes to Dev Tools events', () => {
      initInspector()
      enableInspector()
      onDevToolsEvent!({ type: 'DISPATCH', state: '{"counter": 1}' })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
    })

    it('restricts subscription to only respond to Dev Tools events when Inspector is enabled', () => {
      initInspector()
      enableInspector(false)
      onDevToolsEvent!({ type: 'DISPATCH', state: '{"counter": 1}' })

      const registryVal = getMutableMap()
      expect(registryVal).not.toHaveProperty('counter')
    })

    it('does not subscribe if Dev Tools is not detected', () => {
      enableDevTools(false)
      initInspector()

      expect(onDevToolsEvent).toBeNull()

      enableDevTools(true)
    })
  })
})
