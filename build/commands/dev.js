const ora = require('ora');
const chalk = require('chalk');
const minimist = require('minimist');
const portfinder = require('portfinder');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const utils = require('../utils');
const webpackConfigFunc = require('../../webpack.config');

const argv = minimist(process.argv.slice(2));
const spinner = ora();

(async () => {
    const webpackConfig = await webpackConfigFunc({ WEBPACK_SERVE: true }, argv);

    console.log();
    spinner.text = 'Starting development server...';
    spinner.start();

    const devServerOptions = webpackConfig.devServer;

    const protocol = devServerOptions.https ? 'https' : 'http';
    const host = devServerOptions.host || '0.0.0.0';
    const port = await portfinder.getPortPromise({
        port: devServerOptions.port || 8080,
        host,
    });

    Object.assign(devServerOptions, { host, port });

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(devServerOptions, compiler);

    compiler.hooks.done.tap('dev', (stats) => {
        spinner.stop();

        if (stats.hasErrors()) {
            return;
        }

        console.log('   App running at:');
        if (host === 'localhost' || host.substring(0, 4) === '127.' || host === '0.0.0.0') {
            const hostText = (host === '127.0.0.1') ? 'localhost' : host;
            console.log(`     - Local:   ${chalk.cyan(`${protocol}://${hostText}:${port}`)}`);

            if (host !== '0.0.0.0') {
                console.log(`     - Network: ${chalk.grey('use "--host" to expose')}`);
            }
        }
        if (host !== 'localhost' && host.substring(0, 4) !== '127.') {
            const networkIPs = utils.getNetworkIPs();
            networkIPs.forEach((ip) => {
                console.log(`     - Network: ${chalk.cyan(`${protocol}://${ip}:${port}`)}`);
            });
        }
        console.log();
        console.log(' Note that the development build is not optimized.');
        console.log(` To create a production build, run ${chalk.cyan('yarn build')}.`);
    });

    await server.start();
})();
