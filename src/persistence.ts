import type { Entity } from './entity'

interface AsyncStorage {
  getItem(): Promise<any>
  setItem(value: any): Promise<void>
}

function getLocalStorage() {
  try {
    return localStorage
  } catch (err) {
    return null
  }
}

function getSessionStorage() {
  try {
    return sessionStorage
  } catch (err) {
    return null
  }
}

function validateCustomStorage(storage: any) {
  if (
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  )
    throw new Error('Persistence: Invalid storage.')

  return storage
}

function getItem(
  storage: Storage | AsyncStorage,
  key: string,
  deserialize: (s: string) => any,
  callback: (value: any) => void,
) {
  const res = storage.getItem(key)
  if (res === null) return

  if (typeof res !== 'string' && typeof res.then === 'function')
    res.then(val => {
      if (val != null) processValue(deserialize, val, callback)
    })
  else processValue(deserialize, res, callback)
}

function setItem(
  storage: Storage | AsyncStorage,
  key: string,
  value: any,
  serialize: (val: any) => string,
) {
  processValue(serialize, value, (res: string) => storage.setItem(key, res))
}

function processValue(
  func: (val: any) => any,
  value: any,
  callback: (val: any) => void,
) {
  const res = func(value)
  if (res && typeof res.then === 'function') res.then(callback)
  else callback(res)
}

interface PersistenceOptions {
  storage?: Storage | AsyncStorage | string
  serializeFn?: (val: any) => string
  deserializeFn?: (val: string) => any
}

export default function persistence(
  key: string,
  options: PersistenceOptions = {},
) {
  if (typeof key !== 'string')
    throw new Error('Persistence requires a string key.')

  let storage: Storage | AsyncStorage | null
  const storageOption = options.storage ?? 'local'
  if (storageOption === 'local') storage = getLocalStorage()
  else if (storageOption === 'session') storage = getSessionStorage()
  else storage = validateCustomStorage(storageOption)

  if (!storage) {
    console.warn('Storage unavailable. Persistence disabled.')
    return {}
  }

  return {
    init(origInit: Entity['init'], entity: Entity) {
      return () => {
        const deserialize = options.deserializeFn || JSON.parse

        origInit()

        // Fetch persisted value (if any) from storage
        getItem(storage!, key, deserialize, entity.set)
      }
    },

    set(origSet: Entity['set'], entity: Entity) {
      return (...args: [any, any]) => {
        const serialize = options.serializeFn || JSON.stringify

        origSet(...args)

        // Persist the new value to storage
        setItem(storage!, key, entity.get(), serialize)
      }
    },
  }
}
