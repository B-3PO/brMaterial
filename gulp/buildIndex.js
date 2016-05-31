var paths = require('./config').paths;

var gulp = require('gulp');
var inject = require('gulp-inject');
var mainBowerFiles = require('gulp-main-bower-files');


exports.inject = function () {
  var moduleScripts = gulp.src(paths.moduleScripts, {read: false});
  var moduleCss = gulp.src(paths.moduleCss, {read: false});
  var appScripts = gulp.src(paths.appScripts, {read: false});
  var appCss = gulp.src(paths.appCss, {read: false});
  var bower = gulp.src('./bower.json').pipe(mainBowerFiles());

  return gulp.src('docs/index.html')
    .pipe(inject(appCss, {
      relative: true,
      ignorePath: '../dist/docs/'
    }))
    .pipe(inject(appScripts, {
      name: 'appscripts',
      relative: true,
      ignorePath: '../dist/docs/'
    }))
    .pipe(inject(moduleCss, {
      name: 'moduleCss',
      relative: true,
      ignorePath: '../dist/docs/'
    }))
    .pipe(inject(moduleScripts, {
      name: 'moduleScripts',
      relative: true,
      ignorePath: '../dist/docs/'
    }))
    .pipe(inject(bower, {
      name: 'bower',
      relative: true,
      ignorePath: '../bower_components/'
    }))
    .pipe(gulp.dest(paths.dest));
};
