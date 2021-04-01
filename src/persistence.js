export const persistence = (key, options = {}) => {
  if (typeof key !== 'string')
    throw new Error('Persistence requires a string key.')

  let storage = options.storage || 'local'
  if (storage === 'local') storage = getLocalStorage()
  else if (storage === 'session') storage = getSessionStorage()
  else validateCustomStorage(storage)

  if (!storage) {
    console.warn('Storage unavailable. Persistence disabled.')
    return {}
  }

  return {
    init: (origInit, entity) => () => {
      const deserialize = options.deserializeFn || JSON.parse
      const getItem = async () => {
        const value = await storage.getItem(key)
        if (value) {
          entity.set(await deserialize(value))
        }
      }

      origInit()

      // Fetch persisted value (if any) from storage
      getItem()
    },

    set: (origSet, entity) => (...args) => {
      const serialize = options.serializeFn || JSON.stringify
      const setItem = async () => {
        const value = await serialize(entity.get())
        return storage.setItem(key, value)
      }

      origSet(...args)

      // Persist the new value to storage
      setItem()
    }
  }
}

const getLocalStorage = () => {
  try {
    return localStorage
  } catch (err) {
    return null
  }
}

const getSessionStorage = () => {
  try {
    return sessionStorage
  } catch (err) {
    return null
  }
}

const validateCustomStorage = storage => {
  if (
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  )
    throw new Error('Persistence: Invalid storage.')
}

export default persistence
