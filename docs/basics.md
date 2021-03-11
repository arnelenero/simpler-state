# The Basics

## What is an Entity?

An _entity_ is a single-concern data object whose value can be bound to any number of components in the app as a "shared state". Once bound to a component, an entity's value acts like local state, i.e. it causes the component to update on every change.

Each entity would normally be associated with _actions_, which are just normal functions that make changes to the entity's value.

An entity can hold a value of any data type, including primitive types.


## Creating an Entity

An entity is created using the `entity` function.
```js
entityObj = entity(initialValue)
```
Specifying an initial value is __required__.

The function returns an entity object that provides two essential methods: a getter (`get`) and a setter (`set`). We use these to implement actions. Here's a simple example:

**entities/counter.js**
```js
import { entity } from 'simpler-state'

export const counter = entity(0)

export const increment = by => {
  counter.set(counter.get() + by)
}

export const decrement = by => {
  counter.set(counter.get() - by)
}
```

<details>
  <summary>TypeScript version</summary><br/>

**entities/counter.ts**
```ts
import { entity } from 'simpler-state'

export const counter = entity(0)  // 👈 TS infers entity value is number type

export const increment = (by: number) => {
  counter.set(counter.get() + by)
}

export const decrement = (by: number) => {
  counter.set(counter.get() - by)
}
```

The entity value's type is inferred based on the initial value specified. In cases when this would not be possible, for example if the value is an object type with optional properties, we can enforce its type using generics:
```ts
entity<ValueType>(initialValue)
```

</details>
<br />


## Using an Entity in Components

The `useEntity` hook allows us to bind an entity to a component. It takes an entity object as argument, and returns the current value of the entity, which then behaves like local state.
```js
value = useEntity(entityObj)
```

Here is an example usage:

**CounterView.js**
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

<details>
  <summary>TypeScript version</summary><br/>

**CounterView.tsx**
```tsx
import { useEntity } from 'simpler-state'
import { counter, increment, decrement } from 'counter'

const CounterView = () => {
  const count = useEntity(counter)  // 👈 type inference works!

  return (
    <>
      <div>{count}</div>

      <button onClick={() => increment(1)}> + </button> 
      <button onClick={() => decrement(1)}> - </button>
    </>
  )
}
```

Notice that we don't need to use explicit types here. The `useEntity` hook lets TypeScript do all the type inference for us.

</details>

<br /><br />
[Back to home](index.html) | Next topic → [Recipes](recipes.html)