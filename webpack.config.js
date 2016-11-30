var path = require('path');
var webpack = require('webpack');

const TARGET = process.env.npm_lifecycle_event;

const PATHS = {
    src: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build')
};

module.exports = {
    // cache: true,
    debug: true,
    devtool: 'eval',
    entry: {
        main: path.join(PATHS.src, 'js', 'main.js')
    },
    resolve: {
        modulesDirectories: ['node_modules'],
    },
    output: {
        path: path.join(PATHS.build, 'js'),
        publicPath: './js/',
        filename: '[name].js',
        sourceMapFilename: '[file].map'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }]
    },
    babel: {
        presets: ['latest'],
        plugins: ['transform-runtime']
    },
    devServer: {
        inline: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-id, Content-Length, X-Requested-With",
        }
    }
};
