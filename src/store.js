let storeEnabled = false
export const isStoreEnabled = () => storeEnabled

export const enableStore = (enable = true) => {
  storeEnabled = enable
}

export const store = new Set()

export default store
