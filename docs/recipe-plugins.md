# Extending Functionality with Plug-ins

Don't let the simplicity fool you! SimpleR State can be as feature-rich as you'd like, with its highly flexible plug-in system.


## How a plug-in works

A plug-in is attached to an entity, thereby extending functionality by providing _method overrides_ for its `init` and `set`. Through these overrides, we can do additional handling of the data, such as logging or saving it somewhere.


## Writing a plug-in

A plug-in is simply an object containing either or both of these method overrides:
```js
init: (origInitFn, entity) => newInitFn
set: (origSetFn, entity) => newSetFn
```
Each override function has access to the original method as well as a reference to the entity.

A configurable plug-in is normally implemented as a function that accepts options as arguments, then composes the actual plug-in accordingly.

Let's write an example plug-in that logs on the console every time an entity is updated. It requires a `name` argument to help identify the entity by name in the logs.

**plugins/logger.js**
```js
export const logger = name => {
  return {
    set: (origSet, entity) => (...args) => {
      const prev = entity.get()
      origSet(...args)  // 👈 make sure to call the original `set`

      console.log(`[${name}]`, prev, '-->', entity.get())
    },

    init: (origInit, entity) => () => {
      origInit()  // 👈 make sure to call the original `init`

      console.log(`[${name}] Initial value:`, entity.get())
    }
  }
}
```

<details>
  <summary>TypeScript version</summary><br/>

**plugins/logger.ts**
```ts
import { Plugin } from 'simpler-state'
//                                      👇
export const logger = (name: string): Plugin => {
  return {
    set: (origSet, entity) => (...args) => {
      const prev = entity.get()
      origSet(...args)  // 👈 make sure to call the original `set`

      console.log(`${name}:`, prev, '-->', entity.get())
    },

    init: (origInit, entity) => () => {
      origInit()  // 👈 make sure to call the original `init`

      console.log(`[${name}] Initial value:`, entity.get())
    }
  }
}
```
Explicitly typing the return value as `Plugin` allows type inference to take care of the rest of the typings.

</details><br />


## Using a plug-in

A plug-in is attached when an entity is created as follows:
```js
entityObj = entity(initialValue, [plugin])
```
The second argument is an array, so we can attach multiple plug-ins to the entity. The method overrides then work by _function composition_.

Now let's use our example logger plug-in in the `counter` entity:

**entities/counter.js**
```js
import { logger } from './plugins/logger'

export const counter = entity(0, [logger('counter')])
```
(TypeScript version is the same)


<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
