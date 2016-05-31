var paths = require('./config').paths;

var gulp = require('gulp');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');

exports.getDev = function (srcs) {
  srcs = srcs || paths.css;

  return function dev() {
    return gulp.src(srcs, {base: paths.src})
      .pipe(gulpFilter(function (file) {
        return file.path.indexOf('-theme') === -1;
      }))
      .pipe(autoprefixer())
      .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
      .on('end', function(){
        gutil.log(gutil.colors.green('✔ CSS build'), 'Finished');
      });
  };
};



exports.release = function () {
  return gulp.src(paths.css, {base: paths.src})
    .pipe(gulpFilter(function (file) {
      return file.path.indexOf('-theme') === -1;
    }))
    .pipe(autoprefixer())
    .pipe(concat('brmaterial.css'))
    .pipe(cssnano({zindex: false}))
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
    .pipe(gulp.dest('dist/'))
    .on('end', function () {
      gutil.log(gutil.colors.green('✔ CSS Release'), 'Finished');
    });
};
