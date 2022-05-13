import { enableInspector, initInspector, onInit, onSet } from '../inspector'
import { getMutableMap, updateRegistry } from '../registry'

import type { Entity } from '../entity'

describe('inspector', () => {
  let origExt: any
  let isDevToolsEnabled = true
  let onDevToolsEvent: ((event: any) => void) | null

  const connection = {
    init: jest.fn((state: Record<string, any>) => {}),
    send: jest.fn((action: { type: string }, state: Record<string, any>) => {}),
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

  function mockEntity(name?: string) {
    return {
      name: name ?? 'foo',
      get: jest.fn(),
      set: jest.fn(),
    } as any as Entity
  }

  beforeAll(mockDevTools)
  afterAll(unmockDevTools)

  describe('onInit', () => {
    beforeEach(() => {
      ext.connect.mockClear()
    })

    it('does not proceed if entity is private', () => {
      onInit(mockEntity('_privateFoo'))
      expect(ext.connect).not.toHaveBeenCalled()
    })

    it('initializes Inspector on first invocation only', () => {
      onInit(mockEntity())
      onInit(mockEntity())
      expect(ext.connect).toHaveBeenCalledTimes(1)
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
    })
  })
})
