/* eslint-disable vue/html-indent */
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './conference.js',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['@babel/preset-env'],
      }
    }]
  },
  devtool: 'source-map',
  devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      host: "0.0.0.0"
  }
};
