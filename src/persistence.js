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

      origInit()

      // Fetch persisted value (if any) from storage
      getItem(storage, key, deserialize, entity.set)
    },

    set: (origSet, entity) => (...args) => {
      const serialize = options.serializeFn || JSON.stringify

      origSet(...args)

      // Persist the new value to storage
      setItem(storage, key, entity.get(), serialize)
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

const getItem = (storage, key, deserialize, callback) => {
  const res = storage.getItem(key)
  if (res == null) return

  if (typeof res.then === 'function')
    res.then(val => {
      if (val != null) processValue(deserialize, val, callback)
    })
  else processValue(deserialize, res, callback)
}

const setItem = (storage, key, value, serialize) => {
  processValue(serialize, value, res => storage.setItem(key, res))
}

const processValue = (func, value, callback) => {
  const res = func(value)
  if (res && typeof res.then === 'function') res.then(callback)
  else callback(res)
}

export default persistence
