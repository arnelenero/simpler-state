# SimpleR State

[![npm](https://img.shields.io/npm/v/simpler-state)](https://www.npmjs.com/package/simpler-state)
[![build](https://img.shields.io/travis/arnelenero/simpler-state)](https://travis-ci.org/github/arnelenero/simpler-state)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/simpler-state)](https://coveralls.io/github/arnelenero/simpler-state)
[![license](https://img.shields.io/github/license/arnelenero/simpler-state)](https://opensource.org/licenses/MIT)

__SimpleR State__ is an ultra-lightweight library that provides the simplest state management for React.

- No complicated concepts or boilerplate code
- Just use plain functions to implement state changes
- Largely unopinionated with flexible syntax
- Extremely simple to unit test state changes
- Full TypeScript support with uncomplicated types
- Made specifically for React, and built on React Hooks 
- Multiple times faster than context/reducer solution
- It's tiny, less than 1 KB (minified + gzipped)

Get all these benefits with one dependency install:
```
npm install simpler-state
```

## Two Easy Steps!

__Step 1:__ Create an entity (shared state) and actions (updater functions)

```js
// counter.js

import { entity } from 'simpler-state'

export const counter = entity(0)

export const increment = by => {
  counter.set(counter.get() + by)
}

export const decrement = by => {
  counter.set(counter.get() - by)
}
```

__Step 2:__ Use the entity in your components with hooks

```jsx
import { useEntity } from 'simpler-state'
import { counter, increment, decrement } from 'counter'

const CounterView = () => {
  const count = useEntity(counter)

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

## Documentation

Learn more about SimpleR State at [simpler-state.js.org](https://simpler-state.js.org).
