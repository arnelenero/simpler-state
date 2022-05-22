# <img src="https://simpler-state.js.org/assets/simpler-state-logo.png" alt="SimpleR State" width="240"/>

[![npm](https://img.shields.io/npm/v/simpler-state)](https://www.npmjs.com/package/simpler-state)
[![build](https://img.shields.io/travis/arnelenero/simpler-state)](https://travis-ci.com/github/arnelenero/simpler-state)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/simpler-state)](https://coveralls.io/github/arnelenero/simpler-state)
[![license](https://img.shields.io/github/license/arnelenero/simpler-state)](https://opensource.org/licenses/MIT)

**SimpleR State** is an ultra-lightweight library that provides the _simplest_ state management for React.

- **Minimalist API**—no complicated concepts or boilerplate
- Use **plain functions** to update state (including async)
- Largely **unopinionated** with flexible syntax
- Extremely **simple to unit test** state logic
- Highly extensible with **plug-ins** (e.g. persistence)
- Built-in **developer tools** (Inspector, global reset)
- Full **TypeScript** support with simple types
- Made specifically for React, and built on **React Hooks**
- Fully supports **React 18 Concurrent Mode**
- Several times **faster** than context+reducer solution
- Tiny footprint, just **around 2 KB** (minified + gzipped)

Get all these benefits with one dependency install:

```
npm install simpler-state
```

## Two Easy Steps!

**Step 1:** Create an entity (shared state) and actions (updater functions)

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

**Step 2:** Use the entity in your components with hooks

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

It's that simple! **But the library can do a lot more, so check out the docs website.**

## Documentation

Learn more about what you can do with SimpleR State at [simpler-state.js.org](https://simpler-state.js.org).

## Feedback

**If you like this library, the concept, and its simplicity, please give it a star ⭐️ on the [GitHub repo](https://github.com/arnelenero/simpler-state) to let me know.** 😀

This project has enabled [GitHub Discussions](https://github.com/arnelenero/simpler-state/discussions). Please feel free to post any questions/suggestions there. For issues, please report them [here](https://github.com/arnelenero/simpler-state/issues).

## Prior Art

This library is an evolution of the already production-proven [react-entities](https://github.com/arnelenero/react-entities) that I also wrote. It shares the same stable core, but with a very different API.
