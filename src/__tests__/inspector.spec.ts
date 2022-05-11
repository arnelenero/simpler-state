import { enableInspector, initInspector, onInit, onSet } from '../inspector'

import type { Entity } from '../entity'

describe('inspector', () => {
  let origExt: any
  let devTools: typeof connection
  let isDevToolsEnabled = true

  const connection = {
    init: jest.fn((state: Record<string, any>) => {}),
    send: jest.fn((action: { type: string }, state: Record<string, any>) => {}),
    subscribe: jest.fn((callback: (event: any) => void) => {}),
  }

  const ext = {
    connect: jest.fn(() => {
      return (devTools = connection)
    }),
  }

  function mockDevTools() {
    origExt = window.__REDUX_DEVTOOLS_EXTENSION__
    window.__REDUX_DEVTOOLS_EXTENSION__ = isDevToolsEnabled ? ext : undefined
  }

  function unmockDevTools() {
    window.__REDUX_DEVTOOLS_EXTENSION__ = origExt
  }

  function enableDevTools(enabled = true) {
    isDevToolsEnabled = enabled
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
    })

    it('connects to Dev Tools, setting name to document title', () => {
      initInspector()
      expect(ext.connect).toHaveBeenCalledWith({ name: 'Test' })
    })
  })
})
