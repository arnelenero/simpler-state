# Unit Testing Entities

When we unit test our entities, ideally we would isolate them from the components that use them. What we're testing are the actions and how they update the associated entities.

Since actions are defined outside the entity object, we can easily invoke actions in our tests, then use the entity's `get` method to inspect its current value.

We can also use the `getInitialValue` method in combination with `set` to reset the entity to its initial value before each test case.

Here is an example Jest unit test:

**counter.test.js**
```js
import { counter, increment } from './counter'

beforeEach(() => {
  counter.set(counter.getInitialValue())  // 👈
})

describe('counter', () => {
  describe('increment', () => {
    it('increases the value of the counter', () => {
      //   👇
      increment(1)
      expect(counter.get()).toBe(1);
      //              👆
    })
  })
})
```

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)