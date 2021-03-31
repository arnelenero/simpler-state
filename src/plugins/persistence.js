export const persistence = options => {
  const { defaultStorage, defaultSerializeFn, defaultDeserializeFn } = options

  return {
    id: 'persistence',

    init: (origInit, entity, meta) => {
      validate(meta)

      return meta.persist
        ? () => {
            const storage =
              meta.storage || defaultStorage || window.localStorage
            const deserialize =
              meta.deserializeFn || defaultDeserializeFn || JSON.parse
            const name = meta.persistAs || meta.name
            const getItem = async () => {
              const value = await storage.getItem(name)
              if (value) {
                entity.set(await deserialize(value))
              }
            }

            origInit()

            // Fetch persisted value (if any) from storage
            if (storage) {
              getItem()
            } else {
              console.warn(`Unable to fetch ${name} from storage.`)
            }
          }
        : origInit
    },

    set: (origSet, entity, meta) => {
      validate(meta)

      return meta.persist
        ? (...args) => {
            const storage =
              meta.storage || defaultStorage || window.localStorage
            const serialize =
              meta.serializeFn || defaultSerializeFn || JSON.stringify
            const name = meta.persistAs || meta.name
            const setItem = async () => {
              const value = await serialize(entity.get())
              return storage.setItem(name, value)
            }

            origSet(...args)

            // Persist the new value to storage
            if (storage) {
              setItem()
            } else {
              console.warn(`Unable to persist ${name} to storage.`)
            }
          }
        : origSet
    }
  }
}

const validate = meta => {
  if (meta.persist && !(meta.name || meta.persistAs))
    throw new Error(
      'Inconsistent entity metadata: `persist: true` requires either `name` or `persistAs` to be defined.'
    )
}

export default persistence
