# Quick Start: The TL;DR Cheat Sheet

## Setup

```
npm install simpler-state
```

## Two easy steps!

__Step 1:__ Create an entity (shared state) and actions (updater functions)

```js
// counter.js

import { entity } from 'simpler-state'

export const counter = entity(0)

export const reset = () => {
  counter.set(0)
}

export const increment = by => {
  counter.set(value => value + by)  
}

export const decrement = by => {
  counter.set(value => value - by)
}
```

__Step 2:__ Use the entity in your components with hooks

```jsx
import { counter, increment, decrement } from 'counter'

const CounterView = () => {
  const count = counter.use()

  return (
    <>
      <div>{count}</div>

      <button onClick={() => increment(1)}> + </button> 
      <button onClick={() => decrement(1)}> - </button>
    </>
  )
}
```

It's that simple!  


## Using partial and computed values using transform functions

Use only the relevant part of the entity value
```jsx
const MainView = () => {
  const theme = settings.use(value => value.theme)

  return <Layout theme={theme} /> 
}
```

... or a computed value
```jsx
const RiggedCounter = () => {
  const count = counter.use(value => value + 20)

  return <div>{count}</div>
}
```


## Async actions

You can use `Promise` or `async/await` for actions.
```js
export const loadConfig = async () => {
  settings.set({ ...settings.get(), loading: true })

  const res = await fetchConfig()
  settings.set({ loading: false, config: res })
}
```


## Unit testing of entities

Invoke an action, then use the entity object's `get` method to inspect the value. Use the entity's `init` method to reset its value before each test case.
```js
import { counter, increment } from './counter'

beforeEach(() => {
  counter.init()  // 👈 Reset value
})

describe('counter', () => {
  describe('increment', () => {
    it('increases the value of the counter', () => {
      //   👇 Invoke action
      increment(1)
      expect(counter.get()).toBe(1)
      //              👆 Inspect value
    })
  })
})
```


<br /><br />
[Back to home](index.html) | Next topic → [The Basics](basics.html)
