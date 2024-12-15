const webpack = require('webpack');
const minimist = require('minimist');
const ora = require('ora');
const chalk = require('chalk');
const cliui = require('cliui');
const { rimraf } = require('rimraf');

const utils = require('../utils');
const webpackConfigFunc = require('../../webpack.config');

const argv = minimist(process.argv.slice(2));
const spinner = ora();

(async () => {
    const webpackConfig = await webpackConfigFunc({}, argv);

    console.log();
    spinner.text = `Building for ${webpackConfig.mode}...`;
    spinner.start();

    rimraf(utils.pathResolve('dist') + '/*', { glob: true }).then(() => {
        webpack(webpackConfig, (wpErr, stats) => {
            spinner.stop();
            console.log();

            if (wpErr) {
                console.error(wpErr);
                console.log();
                process.exit(1);
            }

            if (stats.hasErrors()) {
                process.exit(1);
            }

            const getCompressedAsset = (asset, type) => {
                if (!Array.isArray(asset.related)) {
                    return undefined;
                }
                return asset.related.find((relAsset) => relAsset.type === type);
            };

            const isJS = (val) => /\.js$/.test(val);
            const isCSS = (val) => /\.css$/.test(val);
            const assetSorter = (a, b) => {
                if (isJS(a.name) && isCSS(b.name)) {
                    return -1;
                }
                if (isCSS(a.name) && isJS(b.name)) {
                    return 1;
                }
                return b.size - a.size;
            };

            const data = stats.toJson();
            const files = Object.values(data.assetsByChunkName).flat();

            const out = [
                // Column headers
                ['File', 'Size', 'Gzip', 'Brotli'],
            ];
            const totals = {
                size: 0,
                gzip: 0,
                brotli: 0,
            };

            data.assets.sort(assetSorter).forEach((asset) => {
                if (!asset.emitted) {
                    return;
                }

                const gzipAsset = getCompressedAsset(asset, 'gzipped');
                const brotliAsset = getCompressedAsset(asset, 'brotliCompressed');

                totals.size += asset.size;
                totals.gzip += gzipAsset ? gzipAsset.size : asset.size;
                totals.brotli += brotliAsset ? brotliAsset.size : asset.size;

                if (files.includes(asset.name)) {
                    out.push([
                        asset.name,
                        utils.formatSize(asset.size),
                        gzipAsset ? utils.formatSize(gzipAsset.size) : '',
                        brotliAsset ? utils.formatSize(brotliAsset.size) : '',
                    ]);
                }
            });

            out.push([
                'Totals (including assets)',
                utils.formatSize(totals.size),
                utils.formatSize(totals.gzip),
                utils.formatSize(totals.brotli),
            ]);

            const colWidths = out.reduce((acc, row) => {
                row.forEach((col, idx) => {
                    acc[idx] = Math.max(acc[idx] || 0, col.length + 4);
                });
                return acc;
            }, []);

            const table = cliui();
            out.forEach((row, rowIdx) => {
                table.div(
                    ...row.map((col, colIdx) => ({
                        text: (rowIdx === 0 || (rowIdx === out.length - 1 && colIdx === 0))
                            ? chalk.cyan.bold(col)
                            : col,
                        width: colWidths[colIdx],
                        padding: (rowIdx === 0 || rowIdx === out.length - 2)
                            ? [0, 0, 1, 3]
                            : [0, 0, 0, 3],
                    }))
                );
            });

            console.log(table.toString());
            console.log();
            console.log();
            console.log(
                chalk.bgGreen.black(' DONE '),
                `Build Complete. The ${chalk.cyan('dist')} directory is ready to be deployed`
            );
            console.log();
        });
    }).catch((rmErr) => {
        spinner.stop();
        console.log();
        console.error(rmErr);
        console.log();
        process.exit(1);
    });
})();
