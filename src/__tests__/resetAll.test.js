import React, { useEffect } from 'react'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'

import resetAll from '../resetAll'
import entity from '../entity'
import useEntity from '../useEntity'
import { enableStore } from '../store'

describe('resetAll', () => {
  const TestShell = () => {
    useEffect(() => {
      return () => resetAll()
    })
    return <CounterView />
  }

  const CounterView = () => {
    hookValueA = useEntity(counter)
    hookValueB = useEntity(countdown)

    useEffect(() => {
      mountCount++
    }, [])

    return null
  }

  let counter = null
  let increment = null
  let countdown = null
  let decrement = null
  let component = null
  let hookValueA = null
  let hookValueB = null
  let mountCount = 0

  enableStore()

  beforeEach(() => {
    counter = entity(0)
    increment = (by = 1) => counter.set(counter.get() + by)

    countdown = entity(10)
    decrement = (by = 1) => countdown.set(countdown.get() - by)
  })

  afterEach(() => {
    if (component && component.exists()) component.unmount()
  })

  it('resets all entities to initial value', () => {
    component = mount(<TestShell />)

    const prevMountCount = mountCount

    expect(hookValueA).toBe(0)
    act(() => {
      increment()
    })
    expect(hookValueA).toBe(1)

    expect(hookValueB).toBe(10)
    act(() => {
      decrement()
    })
    expect(hookValueB).toBe(9)

    component.unmount()

    component = mount(<TestShell />)

    expect(mountCount).toBe(prevMountCount + 1)
    expect(hookValueA).toBe(0)
    expect(hookValueB).toBe(10)
  })

  it('requires store to be enabled and throws error otherwise', () => {
    enableStore(false)
    expect(() => resetAll()).toThrow()
  })
})
