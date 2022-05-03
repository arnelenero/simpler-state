const { NODE_ENV, BABEL_ENV } = process.env
const commonjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const loose = true

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose,
        targets: commonjs ? { ie: 11 } : { node: '12' },
      },
    ],
    '@babel/react',
  ],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose }],
    commonjs && ['@babel/transform-modules-commonjs', { loose }],
    ['@babel/transform-runtime', { useESModules: !commonjs }],
  ].filter(Boolean),
  comments: false,
}
