var paths = require('./config').paths;

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var through = require('through2');
var del = require('del');


exports.dev = function() {
  return gulp.src(paths.css)
    .pipe(gulpFilter(function (file) {
      return /-theme/.test(file.path);
    }))
    .pipe(concat('theme.js'))
    .pipe(cssnano())
    .pipe(cssToConstant())
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
    .on('end', function() {
      gutil.log(gutil.colors.green('✔ Theme build'), 'Finished');
    });
};


exports.release = function () {
  return gulp.src(paths.css)
    .pipe(gulpFilter(function (file) {
      return /-theme/.test(file.path);
    }))
    .pipe(concat('theme.js'))
    .pipe(cssnano())
    .pipe(cssToConstant())
    .pipe(gulp.dest('src/'))
    .on('end', function() {
      gutil.log(gutil.colors.green('✔ Theme Release'), 'Finished');
    });
};

exports.removeReleaseThemeFile = function () {
  return del('src/theme.js');
};



function cssToConstant () {
  return through.obj(function (file, enc, next) {
    var template = '(function(){ \nangular.module("brMaterial").constant("$BR_THEME_CSS", "%1"); \n})();\n\n';
    var output = file.contents.toString().replace(/\n/g, '').replace(/\"/g,'\\"');

    var jsFile = new gutil.File({
      base: file.base,
      path: file.path.replace('css', 'js'),
      contents: new Buffer(
        template.replace('%1', output)
      )
    });

    this.push(jsFile);
    next();
  });
}
