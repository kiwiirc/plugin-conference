const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const makeSourceMap = process.argv.indexOf('--srcmap') > -1;

module.exports = {
    mode: 'production',
    entry: './src/plugin.js',
    output: {
        filename: 'plugin-conference.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                use: [{loader: 'exports-loader'}, {loader: 'babel-loader'}],
                include: [
                    path.join(__dirname, 'src'),
                ]
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    devtool: makeSourceMap ? 'source-map' : '',
    devServer: {
        filename: 'plugin-conference.js',
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000
    }
};