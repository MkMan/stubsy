module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.spec.tsx'],
      plugins: ['testing-library'],
      extends: ['plugin:testing-library/react'],
      rules: {
        'react/display-name': 'off',
      },
    },
  ],
};
