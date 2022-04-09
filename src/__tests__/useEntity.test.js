import React, { useState, useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'

import useEntity from '../useEntity'
import entity from '../entity'
import { shallowEqual } from '../utils'

describe('useEntity', () => {
  const counterView = (selectKey, equalityFn) => {
    return () => {
      const [key, setKey] = useState(selectKey)
      const selector = key
        ? equalityFn === shallowEqual
          ? val => {
              return { [key]: val[key] }
            }
          : val => val[key]
        : undefined
      setSelectKey = setKey // Allows modifying the selector key from outside

      hookValue = useEntity(counter, selector, equalityFn)

      useEffect(() => {
        renderCount++
      })

      return <></>
    }
  }

  const mountCounter = (selectKey, equalityFn) => {
    const CounterView = counterView(selectKey, equalityFn)
    component = mount(<CounterView />)
  }

  const mountCounterWithAnother = CounterB => {
    const CounterView = counterView()
    component = mount(
      <div>
        <CounterView />
        <CounterB />
      </div>
    )
  }

  let counter = null
  let increment = null
  let touch = null
  let component = null
  let renderCount = 0
  let hookValue = null
  let setSelectKey = null

  beforeEach(() => {
    counter = entity({ value: 0, lastUpdated: new Date() })
    increment = (by = 1) => {
      counter.set({
        value: counter.get().value + by,
        lastUpdated: new Date()
      })
    }
    touch = () => counter.set({ ...counter.get(), lastUpdated: new Date() })
  })

  afterEach(() => {
    if (component.exists()) component.unmount()
  })

  it('returns the current value of the entity', () => {
    mountCounter()

    expect(hookValue).toBeInstanceOf(Object)
    expect(hookValue).toHaveProperty('value', 0)
  })

  it('re-renders the component on each change in entity value caused by an action', () => {
    mountCounter()

    const prevRenderCount = renderCount
    act(() => {
      increment()
    })
    expect(renderCount).toBe(prevRenderCount + 1)
  })

  it('supports server-side rendering', () => {
    // Suppress the annoying useLayoutEffect error message
    const origConsoleError = console.error
    console.error = jest.fn()

    const CounterView = counterView()
    expect(() => {
      ReactDOMServer.renderToString(<CounterView />)
    }).not.toThrow()

    console.error = origConsoleError
  })

  it('always provides the updated entity value to the component', () => {
    mountCounter()

    act(() => {
      increment()
    })
    expect(hookValue).toHaveProperty('value', 1)
  })

  it('subscribes the component to changes in only the relevant fields when using a transform', () => {
    mountCounter('value')

    const prevRenderCount = renderCount
    act(() => {
      touch()
    })
    expect(renderCount).toBe(prevRenderCount)
  })

  it('applies the transform (if any) to the entity value provided to the component', () => {
    mountCounter('value')

    act(() => {
      increment()
    })
    expect(hookValue).toBe(1)
  })

  it('updates subscription whenever the transform changes', () => {
    mountCounter('value')

    act(() => {
      increment()
    })
    expect(hookValue).toBe(1)

    act(() => {
      setSelectKey('lastUpdated')
    })
    // hook now uses a different selector in the transform
    expect(hookValue).toBeInstanceOf(Date)
  })

  it('supports custom equality function for subcription when using a transform', () => {
    mountCounter('value', shallowEqual)

    const prevRenderCount = renderCount
    act(() => {
      touch()
    })
    expect(renderCount).toBe(prevRenderCount)
  })

  it('subscribes all components that use the hook', () => {
    let renderCountB = 0
    let hookValueB = null
    const CounterB = () => {
      hookValueB = useEntity(counter)
      useEffect(() => {
        renderCountB++
      })
      return <></>
    }

    mountCounterWithAnother(CounterB)

    const prevRenderCount = renderCount
    const prevRenderCountB = renderCountB
    act(() => {
      increment()
    })
    expect(renderCount).toBe(prevRenderCount + 1)
    expect(hookValue).toHaveProperty('value', 1)
    expect(renderCountB).toBe(prevRenderCountB + 1)
    expect(hookValueB).toHaveProperty('value', 1)
  })

  it('unsubscribes the component from the entity when it unmounts', () => {
    mountCounter()

    const prevRenderCount = renderCount
    component.unmount()
    act(() => {
      increment()
    })
    expect(renderCount).toBe(prevRenderCount)
  })

  it('checks for valid entity', () => {
    const origConsoleError = console.error
    console.error = jest.fn()

    const CounterView = () => {
      const { value } = useEntity({ value: 0 })
      return <>{value}</>
    }
    expect(() => {
      component = mount(<CounterView />)
    }).toThrow()

    console.error = origConsoleError
  })
})
