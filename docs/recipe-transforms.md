# Binding Only Relevant Data to Components

There are cases where a component doesn't need the exact value of the entity, but rather some derivative of this value. It can either be:
- a portion of the value (e.g. for object type values), or 
- a computed value

In such situation, we can pass a _transform_ function to the entity's `use` hook as follows:
```js
value = entityObj.use(value => relevantValue)
```
This transform function, also called _selector_ in other conventions, takes the current entity value, then returns some other value that is more relevant to the component. The hook then binds only this derived value to the component, thus preventing unnecessary re-renders.

Here's an example:

**MainView.js**
```jsx
import { settings } from './entities/settings'

const MainView = () => {
  const config = settings.use(value => value.config)
  //                                👆
  return ( 
    //  . . .
  )
}
```

<details>
  <summary>TypeScript version</summary><br/>

**MainView.tsx**
```tsx
import { settings } from './entities/settings'

const MainView = () => {
  const config = settings.use(value => value.config)
  //                                👆
  return ( 
    //  . . .
  )
}
```
Notice that type inference still works full force here. No need for explicit types even when working with a transform function.

</details><br />

## Using a custom equality function

When deciding whether it should trigger a re-render, `use` compares the current vs. previous result of the transform function. The default equality check used is `===` (strict equality), but we can specify a different equality function if needed.
```js
value = entityObj.use(transformFn, equalityFn)
```
The `equalityFn` is expected to come in this form:
```js
(a, b) => boolean
```

The library provides `shallowEqual` for cases where the transform function returns an object with top-level properties derived from the entity value, as in this example:

**MainView.js**
```jsx
import { shallowEqual } from 'simpler-state'
import { settings } from './entities/settings'

const MainView = () => {
  const config = settings.use(value => {
    return {
      theme: value.theme,
      enableCountdown: value.featureFlags.countdown
    }
  }, shallowEqual)
  //      👆
  return ( 
    //  . . .
  )
}
```
(Due to type inference, the TypeScript version is the same as above.)

## Optimization

To further enhance the app's performance, it is always a good idea to memoize the transform and equality functions. We can choose from various techniques, such as:
- defining the functions outside the component
- placing the functions alongside the entity and its actions
- using React's `useCallback` hook to keep them inside.

SimpleR State is unopinionated, so it's all up to you to decide.

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
