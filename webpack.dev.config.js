const path = require('path');
const monkey = require('./monkey.dev.config');
const fs = require('fs');
const moment = require('moment');
const colors = require('colors');
const webpack = require('webpack');

if (!fs.existsSync('test')) fs.mkdirSync('test');
fs.writeFileSync('./test/header.js', monkey.buildedHeader());

console.log(
    `[${colors.grey(`${moment().format('HH:mm:ss')}`)}][${colors.grey(
        'Webpack'
    )}] ${colors.green(
        'Copy the content of test/header.js to your TamperMonkey plugin'
    )}`
);

module.exports = {
    entry: monkey.config.entry,
    output: {
        path: path.resolve(__dirname, 'test'),
        filename: monkey.header.name.toLowerCase().replace(/\s/g, '-') + '.js'
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte')
        },
        mainFields: ['svelte', 'browser', 'module', 'main']
    },
    watch: true,
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
            },
            {test: /\.svg$/, loader: 'svg-inline-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};
