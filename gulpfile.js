'use strict';

// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');
var del = require('del');
// Build Dependencies
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
// Style Dependencies
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
// Development Dependencies
var jshint = require('gulp-jshint');
// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');

gulp.task('lint-client', function() {
  return gulp.src(['./src/client/**/*.js', '!./src/client/vendor/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
  return gulp.src('./src/test/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('browserify-client', ['lint-client'], function() {

  var b = browserify({
    entries: 'src/client/index.js',
    debug: gutil.env.DEBUG
  }).transform(babelify, {presets: ["es2015"]});

  return b.bundle()
    .pipe(source('garminello.js'))
    .pipe(buffer())
    .on('error', gutil.log)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('browserify-test', ['lint-test'], function() {

  var b = browserify({
    entries: 'src/test/client/index.js',
    debug: gutil.env.DEBUG
  }).transform(babelify, {presets: ["es2015"]});

  return b.bundle()
    .pipe(source('client-test.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('test', ['lint-test', 'browserify-test'], function() {
  return gulp.src('src/test/client/index.html')
    .pipe(mochaPhantomjs());
});

gulp.task('styles', function() {
  return gulp.src('src/client/less/index.less')
    .pipe(less())
    .pipe(prefix({ cascade: true }))
    .pipe(rename('garminello.css'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('minify', ['styles'], function() {
  return gulp.src('build/garminello.css')
    .pipe(minifyCSS())
    .pipe(rename('garminello.min.css'))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('uglify', ['browserify-client'], function() {
  return gulp.src('build/garminello.js')
    .pipe(uglify())
    .pipe(rename('garminello.min.js'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('assets', function() {
  return gulp.src('src/client/static/**')
    .pipe(gulp.dest('public'));
});

gulp.task('clean', function() {
  return del(['build', 'public']);
});

gulp.task('build', ['clean', 'uglify', 'minify', 'assets']);

gulp.task('watch', function() {
  gulp.watch('src/client/**/*.js', ['build', 'test']);
  gulp.watch('src/test/client/**/*.js', ['test']);
  gulp.watch('src/client/less/*.less', ['minify']);
});

gulp.task('default', ['build', 'test', 'watch']);
