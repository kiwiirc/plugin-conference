module.exports = {
    configs: {
        recommended: [{
            plugins: {
                kiwiirc: require('./class-name-prefix'),
            },
            rules: {
                'kiwiirc/class-name-prefix': 'warn',
            },
        }],
    },
};
