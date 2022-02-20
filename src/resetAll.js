import { store, isStoreEnabled } from './store'

export const resetAll = () => {
  if (!isStoreEnabled())
    throw new Error(
      'resetAll() requires the global store. Call enableStore() at startup.'
    )

  store.forEach(entity => entity.init())
}

export default resetAll
