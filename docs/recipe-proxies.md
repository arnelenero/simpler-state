# Simplifying Nested Object Updates with Proxies

When our entity is a nested object type, making deep updates the React way—no object mutations—can quickly start looking complicated. Take this entity for example:

```js
export const items = entity([])

export const changeItemLabel = (index, label) => {
  items.set(value => [
    ...value.slice(0, index),
    { ...value[index], label },
    ...value.slice(index + 1)
  ])
}
```
All the action does is update the `label` property of an object-type item in the array. But since we're avoiding mutation of __both__ the inner object (item) and the array, our updater function does not look as readable as we might want it to.

We can simplify this using a library like __Immer__ (or your preferred alternative). This gives us a _proxy_ copy of the entire nested structure which we can then __safely mutate at any level of nesting__.

Here's a version of the above example, this time with Immer:
```js
import produce from 'immer'

export const items = entity([])

export const changeItemLabel = (index, label) => {
  items.set(
    produce(value => {
      value[index].label = label   // 👈 mutation allowed
    })
  )
}
```
Other "immutable update" libraries may have a different API from Immer, but the idea and usage remain the same.


<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)