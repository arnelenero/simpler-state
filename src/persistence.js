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
      const getItem = () => {
        _promise(storage.getItem(key)).then(value => {
          if (value) {
            _promise(deserialize(value)).then(value => {
              setTimeout(() => entity.set(value))
            })
          }
        })
      }

      origInit()

      // Fetch persisted value (if any) from storage
      getItem()
    },

    set: (origSet, entity) => (...args) => {
      const serialize = options.serializeFn || JSON.stringify
      const setItem = () => {
        _promise(serialize(entity.get())).then(value => {
          storage.setItem(key, value)
        })
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

/** Turns a value into a Promise (if it's not already) */
const _promise = val => {
  const notPromise =
    typeof val !== 'object' || val === null || typeof val.then !== 'function'
  return notPromise ? new Promise(resolve => resolve(val)) : val
}
