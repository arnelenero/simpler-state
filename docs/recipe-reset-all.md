# Resetting All Entities Between Component Tests

When testing our React components, we normally need a fresh app state on each test run. Because entities are scoped __outside__ the component tree, we need to manually trigger this reset.

The `resetAll` function allows us to conveniently reset __all__ entities to their initial value.

Here is an excerpt from a sample component test in Jest:

**CounterView.test.js**
```js
import CounterView from './CounterView'
import { resetAll } from 'simpler-state'

describe('CounterView', () => {
  beforeEach(() => {
    resetAll()  // 👈 Reset all entities before each test
  })

  // . . .
})
```

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)