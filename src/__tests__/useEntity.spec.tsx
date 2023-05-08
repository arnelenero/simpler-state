// This Jest shim is required by ReactDOMServer.
import { TextEncoder } from 'util'
global.TextEncoder = TextEncoder

import React, { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import { act, render, renderHook } from '@testing-library/react'

import { useEntity } from '../useEntity'
import { entity } from '../entity'
import { shallowEqual } from '../equality'

describe('useEntity', () => {
  interface Counter {
    value: number
    lastUpdated: Date
  }
  interface HookOptions<T> {
    transform?: (value: Counter) => T
    equality?: (a: T, b: T) => boolean
  }

  const counter = entity<Counter>({ value: 0, lastUpdated: new Date() })

  /** Action that increments `counter.value`. */
  function increment(by = 1) {
    counter.set({
      value: counter.get().value + by,
      lastUpdated: new Date(),
    })
  }

  /** Action that updates `counter.lastUpdated` to current timestamp. */
  function touch() {
    counter.set({ ...counter.get(), lastUpdated: new Date() })
  }

  /** Use this when you need to inspect the hook value. */
  function renderUseEntity<T = Counter>(options: HookOptions<T> = {}) {
    return renderHook(
      ({ transform, equality }: HookOptions<T>) =>
        useEntity(counter, transform, equality),
      { initialProps: options },
    )
  }

  /** Use this when you need to inspect the render count. */
  function renderComponent<T = Counter>({
    transform,
    equality,
  }: HookOptions<T> = {}) {
    const renderCount = { current: 0 }
    function CounterView() {
      // We don't need to care about the entity-hook value here.
      useEntity(counter, transform, equality)
      // Increment `renderCount` on every render.
      useEffect(() => {
        renderCount.current++
      })
      return <></>
    }

    const view = render(<CounterView />)
    return { ...view, renderCount }
  }

  beforeEach(() => {
    counter.init()
  })

  it('returns the current value of the entity', () => {
    const { result } = renderUseEntity()

    expect(result.current).toBeInstanceOf(Object)
    expect(result.current).toHaveProperty('value', 0)
  })

  it('re-renders the component on each change in entity value caused by an action', () => {
    const { renderCount } = renderComponent()
    act(() => {
      increment()
    })

    expect(renderCount.current).toBe(2)
  })

  it('supports server-side rendering', () => {
    function CounterView() {
      const { value } = useEntity(counter)
      return <>{value}</>
    }

    expect(() => {
      ReactDOMServer.renderToString(<CounterView />)
    }).not.toThrow()
  })

  it('always provides the updated entity value to the component', () => {
    const { result } = renderUseEntity()
    act(() => {
      increment()
    })

    expect(result.current).toHaveProperty('value', 1)
  })

  it('subscribes the component to changes in only the relevant fields when using a transform', () => {
    const { renderCount } = renderComponent({
      transform: counter => counter.value,
    })
    act(() => {
      touch()
    })

    expect(renderCount.current).toBe(1)
  })

  it('applies the transform (if any) to the entity value provided to the component', () => {
    const { result } = renderUseEntity({
      transform: counter => counter.value,
    })
    act(() => {
      increment()
    })

    expect(result.current).toBe(1)
  })

  it('updates subscription whenever the transform changes', () => {
    const { result, rerender } = renderUseEntity<number | Date>({
      transform: counter => counter.value,
    })
    act(() => {
      increment()
    })

    expect(result.current).toBe(1)

    rerender({ transform: counter => counter.lastUpdated })

    // hook now uses a different selector in the transform
    expect(result.current).toBeInstanceOf(Date)
  })

  it('uses strict equality (identity) by default when determining updates', () => {
    const { renderCount } = renderComponent({
      // This transform results in a fresh object every time.
      transform: ({ value }) => ({ value }),
    })
    act(() => {
      // This action does not change the `value` property.
      touch()
    })

    expect(renderCount.current).toBe(2)
  })

  it('supports custom equality function for subcription when using a transform', () => {
    const { renderCount } = renderComponent({
      // This transform results in a fresh object every time.
      transform: ({ value }) => ({ value }),
      equality: shallowEqual,
    })
    act(() => {
      // This action does not change the `value` property.
      touch()
    })

    expect(renderCount.current).toBe(1)
  })

  it('subscribes all components that use the hook', () => {
    const { result: resultA } = renderUseEntity({
      transform: counter => counter.value,
    })
    const { result: resultB } = renderUseEntity({
      transform: counter => counter.value,
    })
    act(() => {
      increment()
    })

    expect(resultA.current).toBe(1)
    expect(resultB.current).toBe(1)
  })

  it('unsubscribes the component from the entity when it unmounts', () => {
    const { renderCount, unmount } = renderComponent()
    unmount()
    act(() => {
      increment()
    })

    // This is still the original render count. Unmount does not reset it to 0.
    expect(renderCount.current).toBe(1)
  })

  it('checks for valid entity', () => {
    const origConsoleError = console.error
    console.error = jest.fn()

    expect(() => {
      // @ts-ignore: This simulates wrong usage in JS (no TS checking).
      renderHook(() => useEntity({ value: 0 }))
    }).toThrow()

    console.error = origConsoleError
  })
})
