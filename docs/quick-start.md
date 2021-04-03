# Quick Start: TL;DR Cheat Sheet

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
  // --OR-->  counter.set(counter.get() + by)  
}
```

__Step 2:__ Use the entity in your components with hooks

```jsx
import { counter, increment, reset } from 'counter'

const CounterView = () => {
  const count = counter.use()
  // --OR-->  const count = useEntity(counter)

  return (
    <>
      <div>{count}</div>

      <button onClick={() => increment(1)}> + </button> 
      <button onClick={reset}> Reset </button>
    </>
  )
}
```
(Other components can use the shared `counter` the same way.)


## Using partial and computed values in components

Use only the relevant part of the entity value:
```jsx
const MainView = () => {
  const theme = settings.use(value => value.theme)
  //                               👆
  return <Layout theme={theme} /> 
}
```

... or a computed value:
```jsx
const RiggedCounter = () => {
  const count = counter.use(value => value + 20)
  //                               👆
  return <div>{count}</div>
}
```


## Async actions

Use `Promise` or `async/await` for async actions.
```js
export const loadConfig = async () => {
  settings.set({ loading: true, config: null })

  const res = await fetchConfig()
  settings.set({ loading: false, config: res })
}
```


## Async initial value

Use `Promise` or `async` function as initial state to prefetch data.
```js
const fetchTopScores = async () => {
  /* Fetch data from server here ... */
  return data
}
//    Initial value is a Promise  👇  (do NOT `await`)
export const topScores = entity(fetchTopScores())
```


## Persistence

Persist entity value to localStorage:
```js
import { entity, persistence } from 'simpler-state'

export const counter = entity(0, [persistence('counter')])
```

or sessionStorage:
```js
export const counter = entity(0, [
  persistence('counter', { storage: 'session' })
])
```

or custom storage with (optional) custom serializer and deserializer:
```js
const remoteStorage = {
  getItem: async key => {
    const res = await fetchFromServer(key)
    return res.data
  },
  setItem: async (key, value) => {
    await saveToServer(key, value)
  }
}

export const counter = entity(0, [
  persistence('counter', {
    storage: remoteStorage,
    serializeFn: val => JSON.stringify({ value: val, updated: Date.now() }),
    deserializeFn: res => JSON.parse(res).value
  })
])
```


## Orchestrated updates to multiple entities

Implement an action that updates multiple entities by invoking either their `set` method directly, or other actions associated with them.

```js
import { counter } from './entities/counter'
import { signOut } from './entities/auth'

export const logout = () => {
  counter.set(0)  // 👈 using an entity's setter
  signOut()  // 👈 using an associated action
}
```


## Simpler nested-object updates

Use object proxy libraries, such as Immer, to simplify nested-object immutable updates.
```js
import produce from 'immer'

export const items = entity([])

export const changeItemLabel = (index, label) => {
  items.set(
    produce(value => {
      value[index].label = label   // 👈 mutation allowed
    })
  )
}
```


## Unit testing of entities

Invoke an action, then use the entity object's `get` method to inspect the current value. Use the entity's `init` method to reset its value before each test case.
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

## Reset all entities between component tests

Reset all entities to their initial value between component tests.
```js
import CounterView from './CounterView'
import { resetAll } from 'simpler-state'

describe('CounterView', () => {
  beforeEach(() => {
    resetAll()  // 👈 Reset all entities before each test
  })

  // . . .
})
```


<br /><br />
[Back to home](index.html) | Next topic → [The Basics](basics.html)
