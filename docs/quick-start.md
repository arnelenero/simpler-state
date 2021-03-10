# Quick Start

## Setup

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


<br /><br />
[Back to home](index.html) | Next topic → [The Basics](basics.html)
