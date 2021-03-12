# Separating "Pure" Updates from Actions

Using _pure functions_ has its benefits. Since an action can be pretty much any function, it doesn't automatically prevent _side effects_.

To allow us to separate "pure" updates, an entity's `set` function has an alternative form that accepts an _updater function_ in this format:
```js
updaterFn(value, ...args) => newValue
```
where `value` is the current entity value and the optional `args` can be any number of arguments. This function returns the new value to be set.

The `set` function will then have to be invoked in this format: 
```js
entity.set(updaterFn, ...updaterArgs)
```

Here is an example:

**entities/auth.js**
```js
import { entity } from 'simpler-state'
import { login } from '../services/authService'

export const auth = entity({
  userId: '',
  role: '',
  pending: false
})

export const signIn = async (email, password) => {
  auth.set(updatePendingFlag, true)  // 👈

  const { userId, role } = await login(email, password)
  auth.set(updateAuth, userId, role)  // 👈
}

/*** Updater Functions 👇 ***/

const updateAuth = (value, userId, role) => {
  return { userId, role, pending: false }
}

const updatePendingFlag = (value, pending) => {
  return { ...value, pending }
}
```

<details>
  <summary>TypeScript version</summary><br/>

**entities/auth.ts**
```ts
import { entity } from 'simpler-state'
import { login } from '../services/authService'

export interface Auth {
  userId: string
  role: string
  pending: boolean
}

export const auth = entity<Auth>({
  userId: '',
  role: '',
  pending: false
})

export const signIn = async (email: string, password: string) => {
  auth.set(updatePendingFlag, true)  // 👈

  const { userId, role } = await login(email, password)
  auth.set(updateAuth, userId, role)  // 👈
}

/*** Updater Functions 👇 ***/

const updateAuth = (value: Auth, userId: string, role: string) => {
  return { userId, role, pending: false }
}

const updatePendingFlag = (value: Auth, pending: boolean) => {
  return { ...value, pending }
}
```

</details><br />

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
