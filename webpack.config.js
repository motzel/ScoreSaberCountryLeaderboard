const path = require('path');
const monkey = require('./monkey.config');
const webpack = require('webpack');

const Terser = require('terser-webpack-plugin');
const BannerPlugin = require('webpack/lib/BannerPlugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    entry: monkey.config.entry,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename:
            monkey.header.name.toLowerCase().replace(/\s/g, '-') + '.user.js'
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte')
        },
        mainFields: ['svelte', 'browser', 'module', 'main']
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(html|svelte)$/,
                exclude: /node_modules/,
                use: 'svelte-loader'
            },
            {
                test: /\.css$/,
                exclude: /(node_modules)/,
                use: [{ loader: 'css-loader' }, { loader: 'postcss-loader' }]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: ['url-loader']
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
        new Terser({
            terserOptions: {
                mangle: false,
                output: {
                    beautify: false
                }
            }
        }),
        new MinifyPlugin(),
        new BannerPlugin({
            banner: monkey.buildedHeader(),
            raw: true
        })
    ]
};
