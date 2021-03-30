export const persistence = options => {
  const { defaultStorage, defaultSerializeFn, defaultDeserializeFn } = options

  return {
    id: 'persistence',

    init: (origInit, entity, meta) => {
      return meta.persist
        ? () => {
            const storage =
              meta.storage || defaultStorage || window.localStorage
            const deserialize =
              meta.deserializeFn || defaultDeserializeFn || JSON.parse
            const name = meta.persistAs || meta.name || 'entity'
            const getItem = async () => {
              const value = await storage.getItem(name)
              if (value) {
                entity.set(await deserialize(value))
              }
            }

            origInit()

            if (storage) {
              getItem()
            } else {
              console.warn(`Unable to fetch ${name} from storage.`)
            }
          }
        : origInit
    },

    set: (origSet, entity, meta) => {
      return meta.persist
        ? (...args) => {
            const storage =
              meta.storage || defaultStorage || window.localStorage
            const serialize =
              meta.serializeFn || defaultSerializeFn || JSON.stringify
            const name = meta.persistAs || meta.name || 'entity'
            const setItem = async () => {
              const value = await serialize(entity.get())
              return storage.setItem(name, value)
            }

            origSet(...args)

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
