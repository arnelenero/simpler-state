# Orchestrating Updates to Multiple Entities with One Action

Although each action is normally associated with just one entity, it is still defined __outside__ the entity object. Because of this, we can easily implement an action such that it can access and update multiple entities. Such an action is also known as an _orchestrator_.

There are two ways an orchestrator action can update entities:
- directly call the `set` method of each relevant entity, or
- invoke other actions that are associated with the entities

Here's a simplified example:
```js
import { counter } from './entities/counter'
import { signOut } from './entities/auth'

export const logout = () => {
  counter.set(0)  // 👈 using an entity's setter
  signOut()  // 👈 using an associated action
}
```

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
