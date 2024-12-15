const { merge } = require('webpack-merge');

const ESLintPlugin = require('eslint-webpack-plugin');
const ESLintFormatter = require('eslint-formatter-friendly');
const { VueLoaderPlugin } = require('vue-loader');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const utils = require('../utils');
const pkg = require('../../package.json');

const cssConfig = require('./css');

module.exports = (env, argv, config) => {
    let sourceMap;
    if (config.mode === 'development') {
        sourceMap = env.WEBPACK_SERVE ? 'eval-source-map' : 'source-map';
    } else if (argv.srcmap) {
        sourceMap = 'source-map';
    }

    const baseConfig = merge(config, {
        context: process.cwd(),

        entry: {
            app: './src/plugin.js',
        },

        devtool: sourceMap,

        output: {
            path: utils.pathResolve('dist'),
            publicPath: 'auto',
            filename: pkg.name.replace(/^kiwiirc-/, '') + '.js',
        },

        resolve: {
            alias: {
                '@': utils.pathResolve('src'),
            },
            extensions: ['.js', '.jsx', '.vue', '.json'],
        },

        externals: {
            vue: 'kiwi.Vue',
        },

        performance: {
            maxEntrypointSize: 512 * utils.KiB, // 0.5MiB
            maxAssetSize: 512 * utils.KiB, // 0.5MiB
        },

        plugins: [
            new ESLintPlugin({
                emitError: true,
                emitWarning: true,
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
                formatter: ESLintFormatter,
            }),
            new VueLoaderPlugin(),
            new CaseSensitivePathsPlugin(),
            new FriendlyErrorsWebpackPlugin(),
        ],

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: [
                        {
                            loader: 'vue-loader',
                            options: {
                                transformAssetUrls: {
                                    // Defaults
                                    video: ['src', 'poster'],
                                    source: 'src',
                                    img: 'src',
                                    image: ['xlink:href', 'href'],
                                    use: ['xlink:href', 'href'],

                                    // Object can be used for svg files
                                    object: 'data',
                                },
                                compilerOptions: {
                                    comments: false,
                                },
                            },
                        },
                    ],
                },

                {
                    test: /\.js$/,
                    exclude: (file) => /node_modules/.test(file),
                    use: ['babel-loader'],
                },
            ],
        },
    });

    return cssConfig(env, argv, baseConfig);
};
