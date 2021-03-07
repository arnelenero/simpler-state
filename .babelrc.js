const { NODE_ENV, BABEL_ENV } = process.env;
const commonjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs';
const loose = true;

module.exports = {
  presets: [['@babel/env', { loose, modules: false }], '@babel/react'],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose }],
    ['@babel/proposal-class-properties', { loose }],
    commonjs && ['@babel/transform-modules-commonjs', { loose }],
    ['@babel/transform-runtime', { useESModules: !commonjs }],
  ].filter(Boolean),
};
