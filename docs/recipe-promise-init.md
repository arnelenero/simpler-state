# Prefetching Data Using Async Initial Value

An entity's initial value can be of any data type, and that includes `Promise`. In this case, the entity will wait for the Promise to resolve to a value, until then its initial value remains `undefined`. 

A common use-case for such async initial value is _prefetching_ data from the server. So instead of invoking an async action from a component's `useEffect`, for example, we can fetch server data in advance like this:

```js
const fetchTopScores = async () => {
  /* Fetch data from server here ... */
  return data
}(
//    Initial value is a Promise  👇  (do NOT `await`)
export const topScores = entity(fetchTopScores())
```
This triggers the pre-fetch as soon as the entity is created.

In our connected component, we can then display a wait state until the entity receives its async initial value.

```jsx
const ScoreBoard = () => {
  const scores = topScores.use()

  return scores ? <ScoreList scores={scores} /> : <Spinner />
}
```

> __TypeScript Note:__ Type inference works here, too. The entity data type automatically becomes `T | undefined` where `T` is the data type of the return value of the `Promise`.

> __What's the difference between prefetching using async initial value vs. fetching via async action?__ Note that prefetching starts automatically and __immediately__ after the entity is created, even before React components begin to render. On-demand fetching using async action, on the other hand, is normally triggered by some effect or callback in a component. High-priority data that don't require parameters coming from a component are good candidates for prefetching.

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)