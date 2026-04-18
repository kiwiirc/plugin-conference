module.exports = {
    plugins: ['@stylistic/stylelint-plugin'],
    extends: [
        'stylelint-config-standard',
        'stylelint-config-recommended',
        'stylelint-config-recommended-vue',
        'stylelint-config-recommended-vue/scss',
        'stylelint-config-standard-scss',
        'stylelint-config-recommended-scss',
    ],
    overrides: [
        {
            files: ['**/*.vue', '**/*.html'],
            customSyntax: 'postcss-html',
        },
        {
            files: [
                '**/*.scss',
            ],
            customSyntax: 'postcss',
            extends: [
                'stylelint-config-recess-order',
            ],
        },
        {
            files: [],
            customSyntax: 'postcss-html',
            extends: [
                'stylelint-config-recess-order',
            ],
        },
    ],
    rules: {
        'alpha-value-notation': null,
        'color-function-notation': null,
        'declaration-block-no-redundant-longhand-properties': null,
        'declaration-no-important': true,
        'declaration-property-value-no-unknown': null, // breaks css round()"
        'media-feature-range-notation': null,
        'no-descending-specificity': null,
        'number-max-precision': null,
        'property-no-vendor-prefix': null,
        'value-keyword-case': [
            'lower',
            {
                ignoreFunctions: ['v-bind'],
            },
        ],
        'scss/at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    'each',
                    'else',
                    'extends',
                    'for',
                    'function',
                    'if',
                    'ignores',
                    'include',
                    'media',
                    'mixin',
                    'return',
                    'use',

                    // Font Awesome 4
                    'fa-font-path',
                ],
            },
        ],
        'scss/double-slash-comment-empty-line-before': null,
        'scss/double-slash-comment-whitespace-inside': null,
        'scss/no-global-function-names': null,
        'selector-class-pattern': null,
        'shorthand-property-no-redundant-values': null,

        '@stylistic/color-hex-case': 'lower',
        '@stylistic/indentation': 4,
        // '@stylistic/no-empty-first-line': true,
        '@stylistic/number-leading-zero': 'always',
        '@stylistic/property-case': 'lower',
        '@stylistic/string-quotes': 'single',
        '@stylistic/unit-case': 'lower',
    },
};
