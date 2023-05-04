import type { Plugin } from '../entity'

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface AsyncStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
}

/**
 * Persistence plug-in enables storing entity values to `localStorage` (default),
 * `sessionStorage` or custom storage (must implement the Web Storage API).
 *
 * @param key - unique identifier
 * @param options - optional config for storage and serialization/deserialization
 */
export function persistence(
  key: string,
  options: {
    storage?: Storage | AsyncStorage
    serializeFn?: (value: any) => string | Promise<string>
    deserializeFn?: (value: string) => any | Promise<any>
  } = {},
): Plugin {
  if (typeof key !== 'string')
    throw new Error('Persistence requires a string key.')

  const storage = options.storage ?? window.localStorage
  if (!isValidStorage(storage)) {
    console.warn('Storage unavailable. Persistence disabled.')
    return {}
  }

  return {
    init(origInit, entity) {
      return () => {
        const deserialize = options.deserializeFn || JSON.parse

        origInit()

        // Fetch persisted value (if any) from storage.
        getItem(storage!, key, deserialize, entity.set)
      }
    },

    set(origSet, entity) {
      return (...args) => {
        const serialize = options.serializeFn || JSON.stringify

        origSet(...args)

        // Persist the new value to storage.
        setItem(storage!, key, entity.get(), serialize)
      }
    },
  }
}

function isValidStorage(storage: any): boolean {
  return (
    storage &&
    typeof storage.getItem === 'function' &&
    typeof storage.setItem === 'function'
  )
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
  serialize: (val: any) => string | Promise<string>,
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
