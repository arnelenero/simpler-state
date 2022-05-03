import type { Plugin } from './entity'

/**
 * Alias plug-in provides a meaningful name to the entity.
 *
 * @param name - unique name
 */
export default function alias(name: string): Plugin {
  return {
    init(origInit, entity) {
      return () => {
        entity.name = name

        origInit()
      }
    },
  }
}
