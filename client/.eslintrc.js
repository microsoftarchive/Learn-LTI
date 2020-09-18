/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ],
    'no-console': [
      1,
      {
        allow: ['warn', 'error', 'info']
      }
    ],
    '@typescript-eslint/ban-ts-ignore': [0],
    '@typescript-eslint/no-empty-interface': [2],
    '@typescript-eslint/no-use-before-define': [0],
    '@typescript-eslint/no-non-null-assertion': [0],
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/explicit-function-return-type': [
      1,
      {
        allowExpressions: true
      }
    ]
  }
};
