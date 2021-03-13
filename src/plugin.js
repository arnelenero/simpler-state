export const plugins = []

export const plugin = (pluginPkg, options) => {
  plugins.push(pluginPkg(options))
}

export default plugin
