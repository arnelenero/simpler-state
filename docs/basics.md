# The Basics

## What is an Entity?

An _entity_ is a single-concern data object whose value can be bound to any number of components in the app as a "shared state". Once bound to a component, an entity's value acts like local state, i.e. it causes the component to update on every change.

Each entity would typically be associated with _actions_, which are just normal functions that make changes to the entity's value. However, these actions are __not__ contained in the entity object.

An entity can hold a value of any data type, including primitive types.


## Creating an Entity

An entity is created using the `entity` function.
```js
entityObj = entity(initialValue)
```
Specifying an initial value is __required__. The function returns an entity object that provides a setter (`set`) that we can use to implement actions. 

When calling `set` inside actions, we can pass either a straight value...
```js
entityObj.set(newValue)
```

... or an _updater function_, if the new value depends on the current value.
```js
entityObj.set(value => newValue)
```

> __Alternative syntax:__  The entity object also provides a getter (`get`) in case you prefer to use the straight-value format in specifying the new value based on the current. See example below.


Let's create a simple counter entity—the classic contrived example 😀:

**entities/counter.js**
```js
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

<details>
  <summary>TypeScript version</summary><br/>

**entities/counter.ts**
```ts
import { entity } from 'simpler-state'

export const counter = entity(0)  // 👈 TS infers entity value is number type

export const reset = () => {
  counter.set(0)
}

export const increment = (by: number) => {
  counter.set(value => value + by)
  // --OR-->  counter.set(counter.get() + by)  
}
```

The entity value's type is inferred based on the initial value specified. In cases when this would not be possible, for example if the value is an object type with optional properties, we can enforce its type using generics:
```ts
entity<ValueType>(initialValue)
```

</details>
<br />

## Using an Entity in Components

The entity object has a `use` hook that allows us to bind it to a component. The hook returns the current value of the entity, which then behaves like local state.
```js
value = entityObj.use()
```

Alternatively, if you wish to conform to the more familiar naming convention for all hooks, you can import and use the `useEntity` hook:
```js
value = useEntity(entityObj)
```

Keep in mind that the associated actions exist __outside__ the entity object, so we simply import and use them directly.

Here is an example using our counter entity:

**CounterView.js**
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

<details>
  <summary>TypeScript version</summary><br/>

**CounterView.tsx**
```tsx
import { counter, increment, decrement } from 'counter'

const CounterView = () => {
  const count = counter.use()  // 👈 type inference works!
  // --OR-->  const count = useEntity(counter)

  return (
    <>
      <div>{count}</div>

      <button onClick={() => increment(1)}> + </button> 
      <button onClick={() => decrement(1)}> - </button>
    </>
  )
}
```

Notice that we don't need to use explicit types here. The `use` hook lets TypeScript do all the type inference for us.

</details>

<br /><br />
[Back to home](index.html) | Next topic → [Recipes](recipes.html)