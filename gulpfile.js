var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsc = require("gulp-tsc");

gulp.task("build-browser", function () {
    return browserify({ extensions: ['.ts'], standalone: 'createIframeOverlay' })
        .plugin('tsify', { target: 'ES5', removeComments: true })
        .add('./src/iframe-overlay.ts')
        .bundle()
        .pipe(source('iframe-overlay.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task("build-node", function () {
    gulp.src(['src/**/*.ts'])
        .pipe(tsc({ target: 'ES5', removeComments: true }))
        .pipe(gulp.dest('./lib'))
});

gulp.task("default", ["build-node", "build-browser"]);
