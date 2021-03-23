import React, { useState, useEffect } from 'react'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'

import useEntityRef from '../useEntityRef'
import entity from '../entity'
import { shallowEqual } from '../utils'

describe('useEntityRef', () => {
  const counterView = selectKey => {
    return () => {
      const [key, setKey] = useState(selectKey)
      const selector = key ? val => val[key] : undefined
      setSelectKey = setKey // Allows modifying the selector key from outside

      hookValue = useEntityRef(counter, selector)

      useEffect(() => {
        renderCount++
      })

      return <></>
    }
  }

  const mountCounter = selectKey => {
    const CounterView = counterView(selectKey)
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

  it('provides the current value of the entity', () => {
    mountCounter()

    expect(hookValue.current).toBeInstanceOf(Object)
    expect(hookValue.current).toHaveProperty('value', 0)
  })

  it('does NOT re-render the component on each change in entity value caused by an action', () => {
    mountCounter()

    const prevRenderCount = renderCount
    act(() => {
      increment()
    })
    expect(renderCount).toBe(prevRenderCount)
  })

  it('always provides the updated entity value to the component', () => {
    mountCounter()

    act(() => {
      increment()
    })
    expect(hookValue.current).toHaveProperty('value', 1)
  })

  it('applies the transform (if any) to the entity value provided to the component', () => {
    mountCounter('value')

    act(() => {
      increment()
    })
    expect(hookValue.current).toBe(1)
  })

  it('updates subscription whenever the transform changes', () => {
    mountCounter('value')

    act(() => {
      increment()
    })
    expect(hookValue.current).toBe(1)

    act(() => {
      setSelectKey('lastUpdated')
    })
    // hook now uses a different selector in the transform
    expect(hookValue.current).toBeInstanceOf(Date)
  })

  it('subscribes all components that use the hook but does not re-render any of them', () => {
    let renderCountB = 0
    let hookValueB = null
    const CounterB = () => {
      hookValueB = useEntityRef(counter)
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
    expect(renderCount).toBe(prevRenderCount)
    expect(hookValue.current).toHaveProperty('value', 1)
    expect(renderCountB).toBe(prevRenderCountB)
    expect(hookValueB.current).toHaveProperty('value', 1)
  })

  it('checks for valid entity', () => {
    const origConsoleError = console.error
    console.error = jest.fn()

    const CounterView = () => {
      const { value } = useEntityRef({ value: 0 })
      return <>{value}</>
    }
    expect(() => {
      component = mount(<CounterView />)
    }).toThrow()

    console.error = origConsoleError
  })
})
