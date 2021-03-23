# Extending the Library with Plug-ins

Don't let the simplicity fool you! SimpleR State can be as feature-rich as you'd like, with its highly flexible plug-in system.

> __Coming soon:__ A set of pre-built plug-ins will be available soon, providing features like local/remote persistence and dev tools.

## How a plug-in works

A plug-in consists of _method overrides_ for `set` and `init` of __all entities__. Through these overrides, we can extend functionality by doing additional handling of the data, such as logging or saving it somewhere.

An override can look for optional _metadata_ attached to each entity. For example, a logger plug-in can check for a 'name' in the metadata and use that to label the entity in logs by its name. 

Although an override is applied to __all__ entities, it can behave differently for each entity, depending on that entity's metadata. For the logger example, it can check for a 'skip' flag in the metadata to see if it should exclude the entity from the logging.


## Writing a plug-in

A plug-in code comes in the form of a function that accepts an options object and returns a plug-in object.
```js
options => pluginObj
```
The plug-in object consists of a __required__ `id` property, and either or both of these method overrides:
```js
init: (origInitFn, get, meta) => newInitFn
set: (origSetFn, get, meta) => newSetFn
```
A unique `id` is required so that each plug-in can only be installed once throughout the app's lifecycle. Notice that each override accepts the original method of the entity, its `get` method, and its metadata (if any).

As an example, let's write a simple plug-in that logs on the console every time an entity is updated. It will exclude an entity from the logging if its metadata has the `skipLog` flag. It also looks for an optional `name` in the metadata.

**plugins/logger.js**
```js
export const logger = options => {
  return {
    id: 'logger',
    set: (origSet, get, meta) => (...args) => {
      const prev = get()

      origSet(...args)  // 👈 make sure to call the original `set`

      if (meta.skipLog) return

      const name = meta.name || 'entity'
      const log = options.consoleDebug ? console.debug : console.log
      log(`${name} value changed from:`, prev, 'to:', get())
    }
  }
}
```

<details>
  <summary>TypeScript version</summary><br/>

**plugins/logger.ts**
```ts
import { Plugin } from 'simpler-state'

export interface LoggerMeta {
  name?: string
  skipLog?: boolean
}

export interface LoggerOptions {
  consoleDebug?: boolean
}

export type LoggerPlugin = Plugin<LoggerMeta>

export const logger = (options: LoggerOptions): LoggerPlugin => {
  return {
    id: 'logger',
    set: (origSet, get, meta) => (...args) => {
      const prev = get()

      origSet(...args)  // 👈 make sure to call the original `set`

      if (meta.skipLog) return

      const name = meta.name || 'entity'
      const log = options.consoleDebug ? console.debug : console.log
      log(`${name} value changed from:`, prev, 'to:', get())
    }
  }
}
```
Defining the shape of the supported plug-in options and entity metadata allows us to enforce type checks when our plug-in is used.

</details><br />


## Using a plug-in

A plug-in is attached and activated as follows:
```js
plugin(pluginFn, options)
```
where `pluginFn` is the plug-in code we described in the previous section, and `options` is the object passed to the plug-in code.

To use our example logger plug-in, we can insert this code in a top-level source file __outside__ React, such as `index.js`/`index.ts`:
```js
import { plugin } from 'simpler-state'
import { logger } from './plugins/logger'

plugin(logger, { consoleDebug: true })
```
(TypeScript version is the same; property type checking works well on the options object, by type inference with our TS version of `logger`)


## Defining metadata on an entity

We can optionally attach a _meta_ object when creating an entity as follows:
```js
entityObj = entity(initialValue, meta)
```

Here's an example that allows our logger plug-in to label the `counter` entity by its name in the console logs:
```js
export const counter = entity(0, { name: 'counter' })
```
<details>
  <summary>TypeScript version</summary><br/>

```ts
import { LoggerMeta } from './plugins/logger'
//                                       👇                       
export const counter = entity<number, LoggerMeta>(0, { name: 'counter' })
```
Here we use generics to enable type checking on the metadata against the meta properties recognized by the logger plug-in.

</details><br />


<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
