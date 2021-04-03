# Persisting Entity Values

Using the __persistence plug-in__, we can persist the value of an entity to localStorage, sessionStorage, or a custom remote storage.

## Enabling persistence

Persistence is enabled by attaching the plug-in during creation of the entity:
```js
entityObj = entity(initialValue, [persistence(key, options)])
```
where `key` is a __required__ unique string identifier, and `options` is an __optional__ object that contains any of these settings:

- `storage`: any object that implements the Web Storage API's `getItem` and `setItem`
- `serializeFn`: a custom serialization function
- `deserializeFn`: a custom deserialization function

We'll see more on these options in the next sections.

> __Why do we need a key?__ Persistence conforms to the Web Storage API, which stores __key-value pairs__. This is also why we need to make sure that we're supplying a __unique__ key for each entity. 

## Basic usage

By default, persistence uses localStorage. In typical usage, we only need to specify a unique key and that's it. Here's a basic example with the counter entity:

```js
import { entity, persistence } from 'simpler-state'

export const counter = entity(0, [persistence('counter')])
```


## Specifying what storage to use

The `storage` option accepts any of these values:
- `local`: for localStorage (default)
- `session`: for sessionStorage
- custom storage: object that implements both `getItem` and `setItem`

Using the `local` or `session` string value, instead of `localStorage` or `sessionStorage` directly, prevents the error that the browser may throw when Web Storage is disabled.

When specifying a custom storage, both methods can be async, as in the following example:
```js
import { entity, persistence } from 'simpler-state'

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
  persistence('counter', { storage: remoteStorage })
])
```

<details>
  <summary>TypeScript version</summary><br/>

```ts
import { entity, persistence, Storage } from 'simpler-state'
//                      👇
const remoteStorage: Storage = {
  getItem: async key => {
    const res = await fetchFromServer(key)
    return res.data
  },
  setItem: async (key, value) => {
    await saveToServer(key, value)
  }
}

export const counter = entity(0, [
  persistence('counter', { storage: remoteStorage })
])
```
Explicitly typing the custom storage as `Storage` allows type inference to take care of the rest of the typings inside our implementation of the `getItem` and `setItem` methods.

</details><br />


## Custom serialization

Conforming to the Web Storage API, all values we persist to our storage must first be _serialized_ into a __string__. The default serialization function used by persistence is `JSON.stringify`, while the default deserialization is `JSON.parse`.

Note that serialization happens right __before__ every `setItem`, whereas deserialization happens right __after__ `getItem`.

Building upon our example above, if our custom storage requires a different serialization, we can use the `serializeFn` and `deserializeFn` options as follows:
```js
export const counter = entity(0, [
  persistence('counter', {
    storage: remoteStorage,
    serializeFn: val => JSON.stringify({ value: val, updated: Date.now() }),
    deserializeFn: res => JSON.parse(res).value
  })
])
```
(TypeScript version is the same, due to type inference on `persistence`.)

These custom functions can also be async, although they rarely need to be.

> As mentioned, `persistence` is a bundled _plug-in_. SimpleR State's __Plug-in API__ allows adding functionality by extending the basic behavior of entities. You can learn more about how plug-ins work and how to create your own plug-ins [in this recipe page](recipe-plugins.html).

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)