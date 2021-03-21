export const plugins = []

export const plugin = (pluginFn, options = {}) => {
  if (typeof pluginFn !== 'function') throw new Error('Invalid plug-in package')

  if (typeof options !== 'object')
    throw new Error('Plug-in options should be an object.')

  const pluginObj = pluginFn(options)

  if (typeof pluginObj !== 'object') throw new Error('Invalid plug-in')

  if (typeof pluginObj.id !== 'string')
    throw new Error('Plug-in should have an `id`')

  // Prevent installing the same plug-in more than once
  const foundAt = plugins.findIndex(installed => installed.id === pluginObj.id)
  if (foundAt > -1) plugins[foundAt] = pluginObj
  else plugins.push(pluginObj)
}

export default plugin
