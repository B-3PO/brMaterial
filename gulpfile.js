var paths = require('./gulp/config').paths;

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var bump = require('gulp-bump');
var serve = require('gulp-serve');
var Dgeni = require('dgeni');
var gulpSequence = require('gulp-sequence');


var themeBuild = require('./gulp/themeBuilder');
var jsBuild = require('./gulp/buildJs');
var cssBuild = require('./gulp/buildCss');
var indexBuild = require('./gulp/buildIndex');
var demoBuild = require('./gulp/demos');


// require tasks

gulp.task('themeBuild', themeBuild.dev);
gulp.task('themeBuildRelease', themeBuild.release);
gulp.task('removeReleaseThemeFile', themeBuild.removeReleaseThemeFile);
gulp.task('jsBuild', jsBuild.getDev());
gulp.task('jsBuildRelease', jsBuild.release);
gulp.task('cssBuild', cssBuild.getDev());
gulp.task('cssBuildRelease', cssBuild.release);
gulp.task('indexBuild', indexBuild.inject);
gulp.task('demos', demoBuild);





// -- main tasks. use these to watch and build and release

gulp.task('default', gulpSequence('build', ['serve', 'watch']));

gulp.task('build', gulpSequence(
  'clean',
  [
    'copyDocJs',
    'copyDocCss',
    'copyDocPartials',
    'themeBuild',
    'jsBuild',
    'cssBuild',
    'demos',
    'copyFont',
    'docs-generate'
  ],
  'indexBuild',
  'copyPostInjectModules'
));

gulp.task('release', gulpSequence(
  'clean',
  'themeBuildRelease',
  [
    'copyDocJs',
    'copyDocCss',
    'copyDocPartials',
    'jsBuildRelease',
    'cssBuildRelease',
    'demos',
    'copyFontRelease',
    'docs-generate'
  ],
  'indexBuild',
  'copyPostInjectModules',
  'removeReleaseThemeFile'
));




// --- Version Tasks ----

gulp.task('major', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

gulp.task('minor', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('patch', function(){
  gulp.src('./package.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});




// sub tasks

gulp.task('docs-generate', function() {
  var dgeni = new Dgeni([
    require('./docs/config')
  ]);
  return dgeni.generate();
});

gulp.task('copyFont', function () {
  return gulp.src(paths.font)
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/core/'));
});

gulp.task('copyFontRelease', function () {
  return gulp.src(paths.font)
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copyDocJs', function () {
  return gulp.src(['docs/js/app.js', 'docs/js/**/*.js'])
    .pipe(gulp.dest(paths.dest + 'js'));
});

gulp.task('copyDocCss', function () {
  return gulp.src('docs/**/*.css')
    .pipe(gulp.dest(paths.dest));
});

gulp.task('copyDocPartials', function () {
  return gulp.src('docs/**/*.html')
    .pipe(gulp.dest(paths.dest));
});

gulp.task('copyPostInjectModules', function () {
  return gulp.src('docs/modules/**/*')
    .pipe(gulp.dest(paths.dest + 'modules'));
});

gulp.task('clean', function () {
  return del(paths.dest);
});

gulp.task('serve', serve({
  root: ['dist/docs', 'bower_components'],
  port: 8081
}));

gulp.task('watch', function () {
  gulp.watch(paths.scripts, function (event) {
    jsBuild.getDev(event.path)()
      .on('end', function () {
        demoBuild();
        if (event.type !== 'changed') { themeBuilder.inject(); }
      });
  });


  gulp.watch(paths.css, function (event) {
    if (event.path.indexOf('-theme.css') === -1) {
      cssBuild.getDev(event.path)()
        .on('end', function () {
          if (event.type !== 'changed') { themeBuilder.inject(); }
        });
    } else {
      del.sync([paths.dest + 'modules/brmaterial/theme.js']);
      themeBuild.dev()
        .on('end', function () {
            jsBuild.getDev()
        });
    }
  });



  gulp.watch(paths.demoFiles, function (event) {
    demoBuild()
      .on('end', function () {
        gutil.log(gutil.colors.green('✔ Demo'), 'Built');
        if (event.type !== 'changed') { themeBuilder.inject(); }
      });
  });
});
