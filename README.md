# SimpleR State

[![npm](https://img.shields.io/npm/v/simpler-state)](https://www.npmjs.com/package/simpler-state)
[![build](https://img.shields.io/travis/arnelenero/simpler-state)](https://travis-ci.org/github/arnelenero/simpler-state)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/simpler-state)](https://coveralls.io/github/arnelenero/simpler-state)
[![license](https://img.shields.io/github/license/arnelenero/simpler-state)](https://opensource.org/licenses/MIT)

__SimpleR State__ is an ultra-lightweight library that provides the simplest state management for React.

This library is an evolution of [__React Entities__](https://github.com/arnelenero/react-entities).

## Two Easy Steps!

__Step 1:__ Create an entity (shared state) and actions (updater functions)

```js
// counter.js

import { entity } from 'simpler-state'

const counter = entity(0)

const increment = by => {
  counter.set(counter.get() + by)
}

const decrement = by => {
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
