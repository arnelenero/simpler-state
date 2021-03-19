# Async Actions

Since actions are just plain functions, they can be async. This gives us the flexibility of implementing things like async data fetches inside actions.

Here is an example using `async/await` for async action:

**entities/settings.js**
```js
import { entity } from 'simpler-state'
import { fetchConfig } from '../services/configService'

export const settings = entity({
  loading: false,
  config: null
})
//                          👇
export const loadConfig = async () => {
  settings.set({ loading: true, config: null })

  const res = await fetchConfig()
  settings.set({ loading: false, config: res })
}
```

<details>
  <summary>TypeScript version</summary><br/>

**entities/settings.ts**
```ts
import { entity } from 'simpler-state'
import { fetchConfig, Config } from '../services/configService'

export interface Settings {
  loading: boolean
  config: Config
}

export const settings = entity<Settings>({
  loading: false,
  config: null
})
//                          👇
export const loadConfig = async () => {
  settings.set({ loading: true, config: null })

  const res = await fetchConfig()
  settings.set({ loading: false, config: res })
}               
```

</details><br />

<br /><br />
[Back to home](index.html) | [More recipes...](recipes.html)
