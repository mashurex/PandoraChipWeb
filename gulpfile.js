'use strict';
// Prevent EventEmitter warning
require('events').EventEmitter.defaultMaxListeners = Infinity;

const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const debug = require('gulp-debug');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const livereload = require('gulp-livereload');
const WebpackDevServer = require("webpack-dev-server");
const autoprefixer = require('gulp-autoprefixer');
const seq = require('run-sequence');
const clean = require('gulp-clean');
const gutil = require('gulp-util');

const CONFIG = {
    paths: {
        node_modules: path.join(__dirname, 'node_modules'),
        vendor: path.join(__dirname, 'vendor'),
        build: {
            root: path.join(__dirname, 'build'),
            css: path.join(__dirname, 'build/css'),
            js: path.join(__dirname, 'build/js'),
            img: path.join(__dirname, 'build/img'),
            fonts: path.join(__dirname, 'build/fonts'),
            vid: path.join(__dirname, 'build/vid')
        },
        src: {
            root: path.join(__dirname, 'src'),
            scss: path.join(__dirname, 'src/scss'),
            html: path.join(__dirname, 'src/html'),
            img: path.join(__dirname, 'src/img'),
            fonts: path.join(__dirname, 'src/fonts'),
            vid: path.join(__dirname, 'src/vid'),
            js: path.join(__dirname, 'src/js')
        },
    },
    server: {
        port: 8080,
        listen: '0.0.0.0'
    }
};

gulp.task('clean', function () {
    return gulp.src(CONFIG.paths.build.root, {read: false})
        .pipe(clean().on('error', gutil.log));
});

gulp.task('dev:scss', function(){
    return gulp.src([CONFIG.paths.src.scss + '/style.scss'])
        .pipe(debug({ title: 'SCSS Compilation'}))
        // .pipe(plumber())
        // .pipe(sourcemaps.init())
        .pipe(sass({
                       errLogToConsole: true,
                       outputStyle: 'compact',
                       precision: 6
                   }))
        // .pipe(sourcemaps.write({ includeContent: false}))
        .pipe(autoprefixer('last 3 versions', '> 5% in US', 'Android 4.4', 'Android 53'))
        // .pipe(sourcemaps.write('.'))
        // .pipe(plumber.stop())
        .pipe(gulp.dest(CONFIG.paths.build.css))
        .pipe(livereload());
});

gulp.task('dev:views', function(){
    return gulp.src(CONFIG.paths.src.html + '/*.html')
        .pipe(debug({ title: 'HTML Views' }))
        // .pipe(fileinclude({context: { min: false }}))
        .pipe(gulp.dest(CONFIG.paths.build.root))
        .pipe(livereload());
});

gulp.task('dev:js', function(){
    return gulp.src(CONFIG.paths.src.js + '/**/*.js')
        .pipe(debug({ title: 'JavaScript'}))
        .pipe(gulp.dest(CONFIG.paths.build.js))
        .pipe(livereload());
});

gulp.task('build', function(callback){
    seq('clean', ['dev:scss','dev:js','dev:views'], callback);
});

gulp.task('watch', ['build'], function(){
    livereload.listen({ start: true });

    gulp.watch(CONFIG.paths.src.scss + '/**/*.scss', ['dev:scss']);
    // gulp.watch(CONFIG.paths.src.html + '/_partials/**/*.html', ['views:all']);
    gulp.watch(CONFIG.paths.src.html + '/*.html', ['dev:views']);
    gulp.watch(CONFIG.paths.src.js + '/**/*.js', ['dev:js']);
    // gulp.watch('img/**/*.{png,jpg,gif,svg}', { cwd: CONFIG.paths.src.root }, ['img']);

    var compiler = webpack(webpackConfig);
    compiler.plugin('done', function(){
        // console.log('started: browse to http://localhost:8080/build/index.html')
        console.log("Finished WebPack compilation");
    });

    new WebpackDevServer(compiler, {
        // publicPath: CONFIG.paths.build.root,
        stats: {
            colors: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-id, Content-Length, X-Requested-With"
        }
    }).listen(CONFIG.server.port, CONFIG.server.listen, function(err){
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        console.log('[webpack-dev-server] browse to http://%s:%s/build/index.html', CONFIG.server.listen, CONFIG.server.port);
    });
});

gulp.task('default', ['build'], function(callback){
    return callback();
});