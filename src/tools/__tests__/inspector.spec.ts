import {
  enableInspector,
  initInspector,
  onInit,
  onSet,
  features,
} from '../inspector'
import { getMutableMap, updateRegistry } from '../registry'
import { entity } from '../../entity'

import type { Entity } from '../../entity'

describe('inspector', () => {
  let origExt: any
  let isDevToolsEnabled = true
  let isDevToolsInitialized = false
  let onDevToolsEvent: ((event: any) => void) | null
  let lastDevToolsEvent: any = null
  let lastDevToolsState: Record<string, any>

  const connection = {
    init: jest.fn((state: Record<string, any>) => {
      isDevToolsInitialized = true
      lastDevToolsEvent = { type: '@@INIT' }
      lastDevToolsState = state
    }),
    send: jest.fn((event: { type: string }, state: Record<string, any>) => {
      lastDevToolsEvent = event
      lastDevToolsState = { ...state }
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

    it('defers sending initial values to Dev Tools until the first entity `set()`', () => {
      enableInspector()
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      expect(isDevToolsInitialized).toBe(false)

      onSet(counter, 'increment')
      expect(isDevToolsInitialized).toBe(true)
    })

    it('notifies Dev Tools of any lazy-initialized entity', () => {
      enableInspector()
      // Due to stateful logic, this test must come after "defers sending initial..."
      onInit(mockEntity(null, 'foo'))

      expect(lastDevToolsEvent).toHaveProperty('type', 'foo:@@LAZY_INIT')
      expect(lastDevToolsState).toEqual(getMutableMap())
    })
  })

  describe('initInspector', () => {
    document.title = 'Test'

    beforeEach(() => {
      ext.connect.mockClear()
      onDevToolsEvent = null
    })

    it('connects to Dev Tools, setting name to document title, with certain features disabled', () => {
      initInspector()
      expect(ext.connect).toHaveBeenCalledWith({ name: 'Test', features })
    })

    it('initializes the registry', () => {
      initInspector()
      expect(getMutableMap()).toEqual({})
    })

    it('subscribes to Dev Tools "Jump to State" events', () => {
      initInspector()
      enableInspector()
      onDevToolsEvent!({
        type: 'DISPATCH',
        state: '{"counter": 1}',
        payload: { type: 'JUMP_TO_STATE' },
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
    })

    it('subscribes to Dev Tools "Jump to Action" events', () => {
      initInspector()
      enableInspector()
      onDevToolsEvent!({
        type: 'DISPATCH',
        state: '{"counter": 1}',
        payload: { type: 'JUMP_TO_ACTION' },
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
    })

    it('subscribes to Dev Tools "Commit" events', () => {
      initInspector()
      enableInspector()
      const registryVal = getMutableMap()
      onDevToolsEvent!({
        type: 'DISPATCH',
        payload: { type: 'COMMIT' },
      })

      expect(lastDevToolsEvent).toHaveProperty('type', '@@INIT')
      expect(lastDevToolsState).toEqual(registryVal)
    })

    it('subscribes to Dev Tools "Rollback" events', () => {
      initInspector()
      enableInspector()
      onDevToolsEvent!({
        type: 'DISPATCH',
        state: '{"counter": 1}',
        payload: { type: 'ROLLBACK' },
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
      expect(lastDevToolsEvent).toHaveProperty('type', '@@INIT')
      expect(lastDevToolsState).toEqual(registryVal)
    })

    it('subscribes to Dev Tools "Reset" events', () => {
      initInspector()
      enableInspector()
      lastDevToolsEvent = { type: 'increment' }
      lastDevToolsState = { counter: 1 }
      updateRegistry({ counter: 1 })
      onDevToolsEvent!({
        type: 'DISPATCH',
        payload: { type: 'RESET' },
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 0)
      expect(lastDevToolsEvent).toHaveProperty('type', '@@INIT')
      expect(lastDevToolsState).toEqual(registryVal)
    })

    it('subscribes to Dev Tools "Import State" events', () => {
      initInspector()
      enableInspector()
      updateRegistry({ counter: 5 })
      const nextLiftedState = {
        computedStates: [{ state: { counter: 0 } }, { state: { counter: 1 } }],
        currentStateIndex: 1,
      }
      onDevToolsEvent!({
        type: 'DISPATCH',
        payload: {
          type: 'IMPORT_STATE',
          nextLiftedState,
        },
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
      expect(lastDevToolsEvent).toBeNull()
      expect(lastDevToolsState).toEqual(nextLiftedState)
    })

    it('gracefully handles invalid "Import State" payload', () => {
      initInspector()
      enableInspector()
      updateRegistry({ counter: 5 })

      const noNextLiftedState = { type: 'IMPORT_STATE' }
      const noComputedStates = {
        type: 'IMPORT_STATE',
        nextLiftedState: {},
      }
      const emptyComputedStates = {
        type: 'IMPORT_STATE',
        nextLiftedState: { computedStates: [] },
      }
      ;[noNextLiftedState, noComputedStates, emptyComputedStates].forEach(
        payload => {
          expect(() => {
            onDevToolsEvent!({
              type: 'DISPATCH',
              payload,
            })
          }).not.toThrow()

          const registryVal = getMutableMap()
          expect(registryVal).toHaveProperty('counter', 5)
        },
      )
    })

    it('subscribes to Dev Tools "Pause Recording" events', () => {
      initInspector()
      enableInspector()

      const foo = entity('', 'foo')
      foo.set('bar', 'setFooBar')
      onDevToolsEvent!({
        type: 'DISPATCH',
        payload: { type: 'PAUSE_RECORDING' },
      })
      foo.set('boo', 'setFooBoo')

      expect(lastDevToolsEvent).toHaveProperty('type', 'foo:setFooBar')
      expect(lastDevToolsState).toHaveProperty('foo', 'bar')

      // Resume recording.
      onDevToolsEvent!({
        type: 'DISPATCH',
        payload: { type: 'PAUSE_RECORDING' },
      })
    })

    it('restricts subscription to only respond to Dev Tools events when Inspector is enabled', () => {
      initInspector()
      enableInspector(false)
      onDevToolsEvent!({
        type: 'DISPATCH',
        state: '{"counter": 1}',
        payload: { type: 'JUMP_TO_STATE' },
      })

      const registryVal = getMutableMap()
      expect(registryVal).not.toHaveProperty('counter')
    })

    it('does not subscribe if Dev Tools is not detected', () => {
      enableDevTools(false)
      initInspector()

      expect(onDevToolsEvent).toBeNull()

      enableDevTools(true)
    })

    it('gracefully handles invalid state from Dev Tools event', () => {
      initInspector()
      enableInspector()
      updateRegistry({ counter: 1 })

      expect(() => {
        onDevToolsEvent!({
          type: 'DISPATCH',
          state: 'undefined',
          payload: { type: 'JUMP_TO_STATE' },
        })
      }).not.toThrow()

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
    })

    it('ignores Dev Tools event types other than "DISPATCH"', () => {
      initInspector()
      enableInspector()
      updateRegistry({ counter: 1 })
      onDevToolsEvent!({
        type: 'ACTION',
        payload: '{ "type": "DO_SOMETHING" }',
      })

      const registryVal = getMutableMap()
      expect(registryVal).toHaveProperty('counter', 1)
    })
  })

  describe('onSet', () => {
    beforeEach(() => {
      initInspector()
      lastDevToolsEvent = null
      lastDevToolsState = {}
    })

    it('saves the updated value of the entity to the registry', () => {
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      counter.set(1)
      onSet(counter, 'increment')

      expect(getMutableMap()).toHaveProperty('counter', 1)
    })

    it('notifies Dev Tools of the entity update', () => {
      enableInspector()
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      counter.set(1)
      onSet(counter, 'increment')

      expect(lastDevToolsEvent).toHaveProperty('type', 'counter:increment')
      expect(lastDevToolsState).toEqual(getMutableMap())
    })

    it('does not notify Dev Tools of the entity update if Inspector is disabled', () => {
      enableInspector(false)
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      counter.set(1)
      onSet(counter, 'increment')

      expect(lastDevToolsEvent).toBeNull()
    })

    it('does not notify Dev Tools if update came from Inspector', () => {
      enableInspector()
      const counter = mockEntity(0, 'counter')
      onInit(counter)
      counter.set(1)
      onSet(counter, 'increment')
      onSet(counter, '@@DEVTOOLS')

      expect(lastDevToolsEvent).toHaveProperty('type', 'counter:increment')
    })
  })
})
