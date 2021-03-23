import store from './store'

export const resetAll = () => {
  store.forEach(entity => entity.init())
}

export default resetAll
