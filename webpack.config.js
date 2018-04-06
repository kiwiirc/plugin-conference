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
        host: "0.0.0.0",
	port: 9000,
	https: true,
	cert: fs.readFileSync('fullchain.pem'),
	key: fs.readFileSync('privkey.pem'),
        allowedHosts: [
          'cantelope.ml',
          'cantelope.gq',
          'server',
          'localhost'
        ]
    }
};
