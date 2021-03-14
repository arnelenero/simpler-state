export const plugins = []

export const plugin = (pluginFn, options = {}) => {
  if (typeof options !== 'object')
    throw new Error('Plug-in options should be an object.')

  if (typeof pluginFn !== 'function') throw new Error('Invalid plug-in package')

  const pluginObj = pluginFn(options)

  if (typeof pluginObj !== 'object') throw new Error('Invalid plug-in')

  plugins.push(pluginObj)
}

export default plugin
