const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const devConfig = require('./build/configs/dev');
const prodConfig = require('./build/configs/prod');

module.exports = (env, argv) => {
    const isDev = env.WEBPACK_SERVE;
    let config = {
        mode: isDev ? 'development' : 'production',
    };

    if (argv.mode) {
        config.mode = argv.mode;
    }

    if (argv.stats) {
        config.plugins = [
            new BundleAnalyzerPlugin(),
        ];
    }

    if (isDev) {
        config = devConfig(env, argv, config);
    } else {
        config = prodConfig(env, argv, config);
    }

    return config;
};
