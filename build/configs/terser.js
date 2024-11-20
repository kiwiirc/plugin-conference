module.exports = {
    terserOptions: {
        compress: {
            booleans: true,
            conditionals: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            sequences: true,
            unused: true,
        },
        mangle: {
            safari10: true,
        },
        format: {
            comments: false,
        },
    },
    extractComments: {
        condition: false,
    },
};
