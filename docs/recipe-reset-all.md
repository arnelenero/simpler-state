# Resetting All Entities Between Component Tests

When testing our React components, we normally need a fresh app state on each test run. Because entities are scoped **outside** the component tree, we need to manually trigger this reset.

The `resetAll` function allows us to conveniently reset **all** entities to their initial value.

## Before using `resetAll`

> If you are using simpler-state version 1.0, this section does not apply. You can skip to the next section on how to use `resetAll`.

Starting with version 1.1, simpler-state optimizes the lifecycle of the entities so that they are properly garbage collected. This is to support larger applications where entities can be dynamically created and destroyed on demand.

Historically, in order to support `resetAll`, the library adds every entity created by the app in a private global store. Due to the optimization mentioned above, the use of this store is now on an opt-in basis, considering that we would only need it for testing.

We will need to enable the store before we can invoke `resetAll`, otherwise it will throw an error. For this we can use the `enableStore` function. This function needs to be invoked once **before the entities are created**. In Jest, the easiest way to do this is to invoke `enableStore()` in a Jest setup JavaScript.

**setupTests.js**

```js
const { enableStore } = require('simpler-state')

enableStore()
```

If the project was created using Create React App, this setup file should be in the `src` folder and Jest would be pre-configured to look for it there. Otherwise, add this to the Jest config:

```json
{
  "setupFilesAfterEnv": ["./setupTests.js"]
}
```

This will ensure that the store is enabled before any of the modules creating the entities are loaded.

## Calling `resetAll`

Here is an excerpt from a sample component test in Jest:

**CounterView.test.js**

```js
import CounterView from './CounterView'
import { resetAll } from 'simpler-state'

describe('CounterView', () => {
  beforeEach(() => {
    resetAll() // 👈 Reset all entities before each test
  })

  // . . .
})
```

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
