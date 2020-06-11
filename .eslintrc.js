const AbLinter = process.env.NODE_ENV === 'production' ? [] : [];

module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    ...AbLinter
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': 'warn',
    'no-throw-literal': 'off',
    'no-use-before-define': 'off',
    'no-irregular-whitespace': 'off',
    'no-unused-vars': 'off',
    'no-shadow': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-param-reassign': [
      'warn',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'state','item'
        ]
      }
    ],
    'no-return-assign': 'off',
    'max-len': 'off',
    'vue/html-indent': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'vue/require-default-prop': 'off',
    'vue/max-attributes-per-line': [ 'warn', {
      singleline: 3,
      multiline: {
        max: 3,
        allowFirstLine: false
      }
    } ]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
};
