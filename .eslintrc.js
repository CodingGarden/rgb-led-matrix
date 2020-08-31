module.exports = {
  root: true,
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  ignorePatterns: ['node_modules/**/*.js'],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-param-reassign': 0,
    'no-return-assign': 0,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    camelcase: 0,
    'array-callback-return': 0,
    'no-restricted-globals': 0,
  },
};
