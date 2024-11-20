const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge');
const zlib = require('zlib');

const baseConfig = require('./base');
const terserOptions = require('./terser');

module.exports = (env, argv, config) => {
    const compressionTest = /\.(js|css|js.map|css.map|svg|json|ttf|eot|woff2?)(\?.*)?$/;

    const prodConfig = {
        plugins: [
            new CompressionPlugin({
                filename: '[path][base].gz',
                algorithm: 'gzip',
                test: compressionTest,
                compressionOptions: {
                    level: 9,
                },
                threshold: 1024,
            }),
            new CompressionPlugin({
                filename: '[path][base].br',
                algorithm: 'brotliCompress',
                test: compressionTest,
                compressionOptions: {
                    params: {
                        [zlib.constants.BROTLI_PARAM_QUALITY]: 8,
                    },
                },
                threshold: 1024,
            }),
        ],

        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin(terserOptions), new CssMinimizerPlugin()],
        },
    };

    return merge(baseConfig(env, argv, config), prodConfig);
};
