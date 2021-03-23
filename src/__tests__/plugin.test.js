import { plugin, plugins } from '../plugin'

describe('plugin', () => {
  beforeEach(() => {
    plugins.splice(0, plugins.length)
  })

  it('installs a plug-in', () => {
    plugin(() => ({ id: 'test' }))
    expect(plugins).toHaveLength(1)
    expect(plugins[0]).toBeInstanceOf(Object)
  })

  it('supports multiple plug-ins to be installed', () => {
    plugin(() => ({ id: 'test1' }))
    plugin(() => ({ id: 'test2' }))
    plugin(() => ({ id: 'test3' }))
    expect(plugins).toHaveLength(3)
    expect(plugins[0]).toBeInstanceOf(Object)
    expect(plugins[1]).toBeInstanceOf(Object)
    expect(plugins[2]).toBeInstanceOf(Object)
  })

  it('includes all supported methods (if present) in the installed plug-in', () => {
    plugin(() => ({
      id: 'test',
      onInit: (entity, meta) => {},
      shouldIgnoreInit: meta => false,
      onSet: (entity, meta) => {},
      shouldIgnoreSet: meta => false
    }))
    expect(plugins[0]).toHaveProperty('onInit')
    expect(plugins[0]).toHaveProperty('shouldIgnoreInit')
    expect(plugins[0]).toHaveProperty('onSet')
    expect(plugins[0]).toHaveProperty('shouldIgnoreSet')
  })

  it('expects first argument to be a function, and throws otherwise', () => {
    expect(() => {
      plugin({ id: 'test' })
    }).toThrow()
  })

  it('expects second argument (if any) to be an object, and throws otherwise', () => {
    expect(() => {
      plugin(() => ({ id: 'test' }), true)
    }).toThrow()
  })

  it('expects the argument function to return an object, and throws otherwise', () => {
    expect(() => {
      plugin(() => false)
    }).toThrow()
  })

  it('requires the plug-in object to have a string `id`, and throws otherwise', () => {
    expect(() => {
      plugin(() => ({ onSet: () => {} }))
    }).toThrow()
  })

  it('overwrites any prior installed plug-in with same `id`', () => {
    const tester = () => ({
      id: 'tester'
    })
    const newTester = () => ({
      id: 'tester'
    })
    plugin(tester)
    plugin(newTester)
    expect(plugins).toHaveLength(1)
  })
})
