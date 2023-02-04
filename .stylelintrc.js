module.exports = {
    extends: 'stylelint-config-standard',
    overrides: [
        {
            files: ['*.vue', '**/*.vue'],
            customSyntax: 'postcss-html',
        },
    ],
    rules: {
        'alpha-value-notation': null,
        'color-function-notation': null,
        'declaration-no-important': true,
        'indentation': 4,
        'no-descending-specificity': null,
        'no-empty-first-line': null,
        'property-no-vendor-prefix': null,
        'selector-class-pattern': null,
        'shorthand-property-no-redundant-values': null,
        'string-quotes': 'single',
    },
};
