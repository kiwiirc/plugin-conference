module.exports = {
    plugins: ['@stylistic/stylelint-plugin'],
    extends: [
        'stylelint-config-standard',
        'stylelint-config-recommended',
        'stylelint-config-recommended-vue',
        'stylelint-config-standard-scss',
        'stylelint-config-recommended-scss',
        'stylelint-config-recess-order',
    ],
    overrides: [
        {
            files: ['**/*.vue', '**/*.html'],
            customSyntax: 'postcss-html',
        },
    ],
    rules: {
        'alpha-value-notation': null,
        'color-function-notation': null,
        'declaration-block-no-redundant-longhand-properties': null,
        'declaration-no-important': true,
        'media-feature-range-notation': null,
        'no-descending-specificity': null,
        'number-max-precision': null,
        'order/properties-order': null,
        'property-no-vendor-prefix': null,
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
