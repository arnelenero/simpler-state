import store from './store'

export const resetAll = () => {
  for (let i = 0; i < store.length; i++) {
    store[i].init()
  }
}

export default resetAll
