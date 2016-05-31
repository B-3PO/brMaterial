var paths = require('./config').paths;

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');
var wrap = require("gulp-wrap");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var rename = require("gulp-rename");
var filter = require('gulp-filter');

exports.getDev = function (srcs) {
  srcs = srcs || paths.scripts;

  return function dev() {
    return gulp.src(srcs, {base: paths.src})
      .pipe(filterNonCodeFiles())
      .pipe(wrap('(function(){"use strict";<%= contents %>}());'))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
      .on('end', function() {
        gutil.log(gutil.colors.green('✔ JS build'), 'Finished');
      });
  };
}


exports.release = function () {
  return gulp.src(paths.scripts.concat('src/theme.js'), {base: paths.src})
    .pipe(filterNonCodeFiles())
    .pipe(wrap('(function(){"use strict";<%= contents %>}());'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('brmaterial.js'))
    .pipe(gulp.dest('docs/modules/brmaterial/'))
    .pipe(gulp.dest('dist/'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('brmaterial.min.js'))
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
    .pipe(gulp.dest('dist/'))
    .on('end', function() {
      gutil.log(gutil.colors.green('✔ JS Release'), 'Finished');
    });
};


function filterNonCodeFiles() {
  return filter(function(file) {
    return !/demo|module\.json|script\.js|\.spec.js|README/.test(file.path);
  });
}
