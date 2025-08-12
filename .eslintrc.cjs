module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  globalIgnores: ['node_modules/', 'dist/', 'dev-dist/', 'android/', 'ios/'],
  ignorePatterns: ['dist/', '.eslintrc.cjs', 'dev-dist/', 'android/', 'ios/'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
