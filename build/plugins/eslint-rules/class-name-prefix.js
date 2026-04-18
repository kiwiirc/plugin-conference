const pkg = require('../../../package.json');

const pkgClass = pkg.name.replace(/^kiwiirc-/, '');
const pkgClassShort = pkgClass.replace(/^plugin-/, 'p-');

const allowedPrefixes = [
    'kiwi-',
    'kc-',
    'u-',
    `${pkgClass}-`,
];

const specialPrefixes = [
    'irc-fg-',
    'irc-bg-',
    'g-',
];

if (pkgClass !== pkgClassShort) {
    allowedPrefixes.push(`${pkgClassShort}-`);
}

const prefixes = [...allowedPrefixes, ...specialPrefixes];

const reportMessage = `Expected class name to start with one of ['${allowedPrefixes.join("', '")}'] ({{ class }})`;

module.exports = {
    rules: {
        'class-name-prefix': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: `HTML class names must start with one of ['kiwi-', 'u-', 'irc-fg-', 'irc-bg-', 'g-']`,
                    category: 'Stylistic Issues',
                    recommended: true,
                    url: null,
                },
                schema: [],
                messages: {
                    invalidClass: reportMessage,
                },
            },
            create(context) {
                const sourceCode = context.getSourceCode();

                return sourceCode.parserServices.defineTemplateBodyVisitor({
                    "VAttribute[key.name='class']"(node) {
                        if (!node.value || node.value.type !== 'VLiteral') {
                            return;
                        }

                        const classes = node.value.value.split(' ');
                        classes.forEach((c) => {
                            // Ignore empty and fontawesome classes
                            if (!c || c === 'fa' || c.startsWith('fa-')) {
                                return;
                            }
                            if (prefixes.every((p) => !c.startsWith(p))) {
                                context.report({
                                    node,
                                    messageId: 'invalidClass',
                                    data: {
                                        class: c,
                                    },
                                    severity: 1,
                                });
                            }
                        });
                    },
                });
            },
        },
    },
};
