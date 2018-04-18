const fs = require('fs');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './plugin.js',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
    }
};
