# Async Initial Value Using Promise

An entity's initial value can be of any data type, and that includes `Promise`. In this case, the entity will wait for the Promise to resolve to a value, until then its initial value remains `undefined`. 

A common use-case for this is _pre-fetching_ data from the server. So instead of invoking an async action from a component's `useEffect`, for example, we can fetch server data in advance like this:

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

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)