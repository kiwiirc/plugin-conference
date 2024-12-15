const pkg = require('../../../package.json');

const pkgClass = pkg.name.replace(/^kiwiirc-/, '');
const pkgClassShort = pkgClass.replace(/^plugin-/, 'p-');

const allowedPrefixes = [
    'kiwi-',
    'u-',

    `${pkgClass}-`,
];

const specialPrefixes = [
    // IRC colour classes
    'irc-fg-',
    'irc-bg-',

    // Special exception for google recaptcha -  welcome screen.
    'g-',
];

if (pkgClass !== pkgClassShort) {
    allowedPrefixes.push(`${pkgClassShort}-`);
}

const prefixes = [...allowedPrefixes, ...specialPrefixes];

const reportMessage = `Expected class name to start with one of ['${allowedPrefixes.join('\', \'')}'] ({{ class }})`;

module.exports = {
    meta: {
        docs: {
            description: `html class names must start one of ['${allowedPrefixes.join('\', \'')}']`,
            category: 'base',
            url: null,
        },
        fixable: null,
        schema: [],
    },
    create: (context) => context.parserServices.defineTemplateBodyVisitor({
        'VAttribute[key.name=\'class\']': (node) => {
            const classes = node.value.value.split(' ');
            classes.forEach((c) => {
                // Ignore empty and fontawesome classes
                if (!c || c === 'fa' || c.startsWith('fa-')) {
                    return;
                }
                if (prefixes.every((p) => !c.startsWith(p))) {
                    context.report({
                        node,
                        message: reportMessage,
                        data: {
                            class: c,
                        },
                    });
                }
            });
        },
    }),
};
