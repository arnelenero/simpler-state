export const plugins = []

export const plugin = (pluginPkg, options = {}) => {
  if (typeof options !== 'object')
    throw new Error('Plug-in options should be an object.')

  if (typeof pluginPkg !== 'function')
    throw new Error('Invalid plug-in package')

  plugins.push(pluginPkg(options))
}

export default plugin
