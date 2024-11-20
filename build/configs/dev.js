const { merge } = require('webpack-merge');
const murmurhash3 = require('murmurhash3js');
const utils = require('../utils');
const pkg = require('../../package.json');

const baseConfig = require('./base');

module.exports = (env, argv, config) => {
    const pluginNumber = Math.abs(murmurhash3.x86.hash32(pkg.name)) % 1000;
    const portNumber = utils.mapRange(pluginNumber, 0, 999, 9000, 9999);

    const devConfig = {
        plugins: [],

        devServer: {
            devMiddleware: {
                publicPath: 'auto',
            },
            open: false,
            host: '127.0.0.1',
            port: portNumber,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            static: [
                {
                    directory: utils.pathResolve('static'),
                    publicPath: 'static',
                },
            ],
            client: {
                logging: 'info',
                overlay: {
                    runtimeErrors: true,
                    errors: true,
                    warnings: false,
                },
            },
        },

        infrastructureLogging: {
            level: 'warn',
        },

        stats: {
            all: false,
            loggingDebug: ['sass-loader'],
        },
    };

    if (argv.host) {
        devConfig.devServer.host = argv.host === true ? '0.0.0.0' : argv.host;
    }

    if (argv.port) {
        devConfig.devServer.port = argv.port;
    }

    return merge(baseConfig(env, argv, config), devConfig);
};
