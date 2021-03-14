# Extending the Library with Plug-ins

Don't let the simplicity fool you! SimpleR State can be as feature-rich as you'd like, with its highly flexible plug-in system.

> __Coming soon:__ A set of pre-built plug-ins will be available soon, providing features like local/remote persistence and dev tools.


## How a plug-in works

A plug-in consists of _taps_ into methods that cause a value change in entities, i.e. `set` and `init`. Through these taps, we can extend functionality by doing additional handling of the data, such as logging or saving it somewhere.

For each tap, there are 2 things we can define:
- what to do each time the entity value changes
- whether the tap should be applied to the specific entity

A tap can look for optional _metadata_ attached to each entity, which influence the tap's behavior. For example, a logger tap can check for a 'name' in the metadata and use that to identify the specific entity in the logs. It can also check for a 'skip' flag in the metadata when deciding whether it should exclude the entity from the logging altogether.


## Writing a plug-in

A plug-in code comes in the form of a function that accepts an options object and returns a plug-in object.
```js
options => pluginObj
```
The plug-in object consists of any of these methods that define the taps and plug-in behavior:
```js
onInit(entity, meta)
shouldIgnoreInit(meta)
onSet(entity, meta)
shouldIgnoreSet(meta)
```
 
As an example, let's write a simple plug-in that logs every time an entity value changes.

**plugins/logger.js**
```js
export const logger = options => {
  return {
    onSet: (entity, meta) => {
      const name = meta.name || 'entity'
      const log = options.consoleDebug ? console.debug : console.log
      log(`${name} value set to:`, entity.get())
    },
    shouldIgnoreSet: meta => meta.skipLog === true
  }
}
```

<details>
  <summary>TypeScript version</summary><br/>

**plugins/logger.ts**
```ts
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
    onSet: (entity, meta) => {
      const name = meta.name || 'entity'
      const log = options.consoleDebug ? console.debug : console.log
      log(`${name} value set to:`, entity.get())
    },
    shouldIgnoreSet: meta => meta.skipLog === true
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

To use our example logger plug-in, we can insert this code in a top-level component such as `App`:
```js
import { logger } from './plugins/logger'

plugin(logger, { consoleDebug: true })
```
(TypeScript version is the same; property type checking works well on the options object, by type inference with our TS version of `logger`)


## Defining metadata on an entity

We can optionally attach a _meta_ object when creating an entity as follows:
```js
entityObj = entity(initialValue, meta)
```

Here's an example that allows our logger plug-in to identify the `counter` entity by its name in the console logs:
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


# Making a plug-in ignore an entity

Following our logger example, by default all entities will be included in the logs, except when a `skipLog` flag is set in the entity. This logic was defined in the logger plug-in as follows:
```js
    shouldIgnoreSet: meta => meta.skipLog === true
```

Let's say we don't need the `settings` entity to be included in the logging, so we can attach the appropriate metadata to it as follows:
```js
export const settings = entity(null, { skipLog: true })
```

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
