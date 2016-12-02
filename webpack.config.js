var path = require('path');
var webpack = require('webpack');

const TARGET = process.env.npm_lifecycle_event;

const PATHS = {
    src: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build')
};

//noinspection JSUnresolvedFunction
module.exports = {
    cache: true,
    debug: true,
    devtool: 'cheap-eval-source-map',
    entry: path.join(PATHS.src, 'js', 'main.js'),
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            jquery: 'jquery/dist/jquery',
            tether: 'tether'
        },
        extensions: ['','.js']
    },
    output: {
        path: path.join(PATHS.build, 'js'),
        // publicPath: './js/',
        filename: '[name].js',
        sourceMapFilename: '[file].map',
        // libraryTarget: 'var'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ],
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
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Tether: 'tether',
            'window.Tether': 'tether'
        })
    ]
};
