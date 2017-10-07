var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var pug = require('gulp-pug');
var autoprefix = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var filter = require('gulp-filter')
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var jsmin = require('gulp-jsmin');

gulp.task('js', function () {
    return gulp.src('./app/js/*.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('js-watch', ['js'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('sass', function () {
    return gulp.src('./app/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('sass-watch', ['sass'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('templates', function() {
    return gulp.src('./app/templates/*.pug')
        .pipe(pug())
        .pipe(filter(function (file) {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('pug-watch', ['templates'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('fonts', function() {
    return gulp.src('./app/fonts/*')
        .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('imgs', function() {
    return gulp.src('./app/imgs/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/imgs'));
});

gulp.task('watch', ['templates','sass','js'], function () {

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("./app/js/*.js", ['js-watch']);
    gulp.watch("./app/templates/**/*.pug", ['pug-watch']);
    gulp.watch("./app/scss/**/*.scss", ['sass-watch'])
});

// only run 'imgs' task when you build, it takes forever
gulp.task('build', ['templates','sass', 'js', 'imgs', 'fonts']);