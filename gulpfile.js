var gulp = require('gulp');
var to5 = require('gulp-6to5');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('compile', function () {
    return gulp.src('src/**/*.js')
        .pipe(to5({ format: { indent: {style: "    "} } }))
        .pipe(gulp.dest('lib'));
});

gulp.task('bundle', ['compile'], function () {
    return browserify({ standalone: "iframeOverlay" })
        .require("./lib/iframe-overlay.js", { entry: true })
        .bundle()
        .pipe(source('iframe-overlay.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['bundle']);
