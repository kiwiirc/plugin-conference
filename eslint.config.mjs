/* eslint sort-keys: ['error', 'asc', { allowLineSeparatedGroups: true }] */
/* eslint-disable sort-keys */

import globals from 'globals';
import js from '@eslint/js';
import vueParser from 'vue-eslint-parser';
import jsdoc from 'eslint-plugin-jsdoc';

import pluginVue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import pluginImport from 'eslint-plugin-import';
import pluginStylistic from '@stylistic/eslint-plugin';
import kiwiirc from '@kiwiirc/eslint-plugin';

import * as utils from './build/utils.js';

export default [
    js.configs.recommended,
    pluginImport.flatConfigs.recommended,
    pluginStylistic.configs.all,
    ...pluginVueA11y.configs['flat/recommended'],
    ...pluginVue.configs['flat/recommended'],
    ...kiwiirc.configs.recommended,

    {
        plugins: {
            jsdoc,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parser: vueParser,
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                parser: '@babel/eslint-parser',
                extraFileExtensions: ['.vue'],
            },
        },

        settings: {
            'import/resolver': {
                alias: {
                    map: [['@', utils.pathResolve('src')]],
                    extensions: ['.js', '.vue', '.json'],
                },
            },
        },

        /* eslint-enable sort-keys */
        rules: {
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

            'arrow-body-style': ['error', 'as-needed'],
            'no-await-in-loop': 'error',
            'no-cond-assign': [
                'error',
                'always',
            ],
            'no-control-regex': 'off',
            'no-else-return': 'error',
            'no-multiple-empty-lines': ['error', {
                max: 1,
                maxEOF: 0,
            }],
            'no-new': 'error',
            'no-param-reassign': ['error', {
                props: false,
            }],
            'no-underscore-dangle': [
                'error',
                {
                    enforceInMethodNames: true,
                },
            ],
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTaggedTemplates: true,
                    allowTernary: true,
                },
            ],
            'no-unused-vars': ['error', {
                args: 'none',
                caughtErrors: 'none',
            }],
            'no-use-before-define': [
                'error',
                {
                    classes: false,
                    functions: true,
                    variables: true,
                },
            ],
            'object-shorthand': ['error', 'always'],
            'prefer-const': 'error',
            'prefer-destructuring': 'off',

            /*
                Import Rules
            */
            'import/extensions': ['error', 'ignorePackages', {
                js: 'always',
                vue: 'always',
            }],
            'import/no-cycle': 'off',
            'import/no-unresolved': ['error', {
                ignore: [
                    // virtual path to locales
                    '^locale:',
                ],
            }],
            'import/prefer-default-export': 'off',

            /*
                Vue Rules
            */
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': ['error', {
                multiline: {
                    max: 1,
                },
                singleline: {
                    max: 8,
                },
            }],
            'vue/max-len': ['error', {
                code: 120,
                comments: 120,
                ignoreRegExpLiterals: true,
                ignoreTemplateLiterals: true,
                ignoreUrls: true,
                tabWidth: 4,
                template: 120,
            }],
            'vue/no-mutating-props': ['error', {
                shallowOnly: true,
            }],
            'vue/no-v-html': 'off',

            /*
                Stylistic Rules
            */
            '@stylistic/array-bracket-newline': ['error', 'consistent'],
            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/comma-dangle': ['error', {
                arrays: 'always-multiline',
                exports: 'never',
                functions: 'ignore',
                imports: 'never',
                objects: 'always-multiline',
            }],
            '@stylistic/dot-location': ['error', 'property'],
            '@stylistic/function-call-argument-newline': ['error', 'consistent'],
            '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
            '@stylistic/indent': ['error', 4, {
                SwitchCase: 0,
            }],
            '@stylistic/multiline-ternary': ['error', 'always-multiline'],
            '@stylistic/no-extra-parens': ['error', 'all', {
                ignoredNodes: ['NewExpression > MemberExpression'],
                nestedBinaryExpressions: false,
            }],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/object-property-newline': ['error', {
                allowAllPropertiesOnSameLine: true,
            }],
            '@stylistic/quote-props': ['error', 'consistent-as-needed'],
            '@stylistic/quotes': ['error', 'single', {
                allowTemplateLiterals: 'avoidEscape',
                avoidEscape: true,
            }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/space-before-function-paren': ['error', {
                anonymous: 'always',
                asyncArrow: 'always',
                named: 'never',
            }],

            /*
                Stylistic Remove
            */
            '@stylistic/array-element-newline': 0,
            '@stylistic/indent-binary-ops': 0,
            '@stylistic/lines-around-comment': 0,
            '@stylistic/multiline-comment-style': 0,
            '@stylistic/newline-per-chained-call': 0,
            '@stylistic/padded-blocks': 0,
            '@stylistic/wrap-regex': 0,

            /*
                Accessibility Rules
            */
            'vuejs-accessibility/click-events-have-key-events': 'off',
            'vuejs-accessibility/interactive-supports-focus': 'off',
            'vuejs-accessibility/mouse-events-have-key-events': 'off',
        },

    },

    // {
    //     ignores: [],
    //     linterOptions: {
    //         reportUnusedDisableDirectives: 'off',
    //     },
    //     rules: {
    //         'no-else-return': 'off',
    //         'no-use-before-define': 'off',
    //         'object-shorthand': 'off',
    //         'prefer-const': 'off',
    //         'prefer-destructuring': 'off',

    //         /*
    //             Import Rules
    //         */
    //         'import/extensions': 'off',

    //         /*
    //             Vue Rules
    //         */
    //         'vue/max-attributes-per-line': 'off',
    //         'vue/max-len': ['error', {
    //             code: 120,
    //             comments: 120,
    //             ignoreRegExpLiterals: true,
    //             ignoreStrings: true,
    //             ignoreTemplateLiterals: true,
    //             ignoreUrls: true,
    //             tabWidth: 4,
    //             template: 120,
    //         }],
    //         'vue/multi-word-component-names': 'off',
    //         'vue/multiline-html-element-content-newline': 'off',
    //         'vue/no-unused-components': 'off',
    //         'vue/one-component-per-file': 'off',
    //         'vue/require-default-prop': 'off',
    //         'vue/require-explicit-emits': 'off',
    //         'vue/require-prop-types': 'off',
    //         'vue/singleline-html-element-content-newline': 'off',
    //         'vue/v-on-event-hyphenation': 'off',

    //         /*
    //             Stylistic Rules
    //         */
    //         '@stylistic/multiline-ternary': 'off',
    //         '@stylistic/no-extra-parens': 'off',
    //         '@stylistic/operator-linebreak': 'off',

    //         /*
    //             Accessibility Rules
    //         */
    //         'vuejs-accessibility/anchor-has-content': 'off',
    //         'vuejs-accessibility/form-control-has-label': 'off',
    //         'vuejs-accessibility/iframe-has-title': 'off',
    //         'vuejs-accessibility/label-has-for': 'off',
    //         'vuejs-accessibility/no-static-element-interactions': 'off',
    //     },
    // },

    {
        files: ['eslint.config.mjs', '*.js', 'build/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },

        rules: {
            'import/extensions': ['error', {
                js: 'ignorePackages',
                json: 'ignorePackages',
            }],
            'import/no-extraneous-dependencies': ['error', {
                devDependencies: true,
            }],
            'no-console': 'off',
            'no-underscore-dangle': 'off',
        },

    },

    {
        ignores: ['dist', 'tests', '**.old.**'],
    },
];
