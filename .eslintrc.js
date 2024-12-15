const utils = require('./build/utils');

module.exports = {
    root: true,

    env: {
        browser: true,
        es6: true,
        node: true,
    },

    parser: 'vue-eslint-parser',

    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 2020,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
    },

    plugins: ['@kiwiirc', 'jsdoc'],

    extends: [
        'plugin:vue/recommended',
        'eslint:recommended',
        '@vue/airbnb',
        'standard',
    ],

    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', utils.pathResolve('src')],
                ],
                extensions: ['.js', '.vue', '.json'],
            },
        },
    },

    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

        '@kiwiirc/class-name-prefix': 'warn',

        'class-methods-use-this': 0,
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'never',
            exports: 'never',
            functions: 'ignore',
        }],
        'import/extensions': 0,
        'import/no-cycle': 0,
        'import/prefer-default-export': 0,
        'indent': ['error', 4],
        // 'max-len': ['error', { code: 120 }],
        'max-classes-per-file': 0,
        'no-continue': 0,
        'no-else-return': 0,
        'no-multi-assign': 0,
        'no-param-reassign': ['error', { props: false }],
        'no-plusplus': 0,
        'no-prototype-builtins': 0,
        'no-control-regex': 0,
        'object-shorthand': 0,
        'operator-linebreak': 0,
        'prefer-destructuring': 0,
        'prefer-object-spread': 0,
        'prefer-promise-reject-errors': 0,
        'prefer-template': 0,
        'quote-props': ['error', 'consistent-as-needed'],
        'semi': ['error', 'always'],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always',
        }],
        'vue/html-indent': ['error', 4],
        'vue/max-len': [
            'error',
            {
                code: 120,
                template: 120,
                tabWidth: 4,
                comments: 120,
                ignoreComments: true,
            },
        ],
        'vue/max-attributes-per-line': 0,
        'vue/multi-word-component-names': 0,
        'vue/multiline-html-element-content-newline': 0,
        'vue/no-mutating-props': ['error', {
            shallowOnly: true,
        }],
        'vue/no-v-html': 0,
        'vue/prefer-template': 0,
        'vue/require-default-prop': 0,
        'vue/require-prop-types': 0,
        'vue/singleline-html-element-content-newline': 0,
        'vuejs-accessibility/anchor-has-content': 0,
        'vuejs-accessibility/click-events-have-key-events': 0,
        'vuejs-accessibility/form-control-has-label': 0,
        'vuejs-accessibility/iframe-has-title': 0,
        'vuejs-accessibility/interactive-supports-focus': 0,
        'vuejs-accessibility/label-has-for': 0,
        'vuejs-accessibility/mouse-events-have-key-events': 0,
        'vuejs-accessibility/media-has-caption': 0,
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
        {
            files: ['webpack.config.js', 'build/**/*.js'],
            rules: {
                'import/no-extraneous-dependencies': 0,
                'no-console': 0,
            },
        },
    ],
};
