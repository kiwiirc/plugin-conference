const Autoprefixer = require('autoprefixer');
const { merge } = require('webpack-merge');

const cssRules = [
    {
        test: /\.css$/,
        use: [
            {
                loader: 'vue-style-loader',
            },
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    esModule: false,
                },
            },
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [Autoprefixer],
                    },
                },
            },
        ],
    },
    {
        test: /\.less$/,
        use: [
            {
                loader: 'vue-style-loader',
            },
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    esModule: false,
                },
            },
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [Autoprefixer],
                    },
                },
            },
            {
                loader: 'less-loader',
            },
        ],
    },
    {
        test: /\.s[ac]ss$/,
        use: [
            {
                loader: 'vue-style-loader',
            },
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    esModule: false,
                },
            },
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [Autoprefixer],
                    },
                },
            },
            {
                loader: 'sass-loader',
            },
        ],
    },
];

module.exports = (env, argv, config) => merge(config, {
    module: {
        rules: cssRules,
    },
});
