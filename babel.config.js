const commonjs = process.env.BUILD_TARGET === 'commonjs'
const isEnvTest = process.env.NODE_ENV === 'test'

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        modules: commonjs && 'commonjs',
        targets: isEnvTest ? { node: 'current' } : {},
      },
    ],
    '@babel/typescript',
    '@babel/react',
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      {
        useESModules: !commonjs,
      },
    ],
  ],
  comments: false,
}
