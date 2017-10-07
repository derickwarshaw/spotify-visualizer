var gulp = require('gulp');
var gls = require('gulp-live-server');
var sass = require('gulp-sass');
var autoprefix = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var jsmin = require('gulp-jsmin');
var livereload = require('gulp-livereload');

gulp.task('serve', ['sass', 'js'], function() {
    var server = gls('index.js', undefined, 1111);
    server.start();
    livereload.listen();
   
    gulp.watch(['./index.js', './routes/*.js'], function() {
        console.log('index.js changed');
        server.start.bind(server)();
    });

    gulp.watch('./app/scss/**/*.scss', ['sass']);

    gulp.watch('./app/js/**/*.js', ['js']);

    // gulp.watch('./views/**/*.pug', function(file) {
    //  livereload.reloadPage();
    // });
});

gulp.task('sass', function () {
    return gulp.src('./app/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function() {
    return gulp.src('./app/js/*.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/js'))
        .pipe(livereload());
});