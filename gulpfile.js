var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

gulp.task('serve', function () {
  livereload.listen();

  nodemon({
    script: './bin/www',
    ext: 'js',
    ignore: ['views', 'client', 'build'],
    env: {
      'NODE_ENV': 'development',
      'DEBUG': 'counter'
    }
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Express\ server\ listening/.test(chunk)) {
        livereload.reload();
      }
      process.stdout.write(chunk);
    });
  });

  gulp.watch(['views/**', 'public/**'])
    .on('change', function(event) {
      livereload.changed(event);
    });
});

gulp.task('default', ['serve']);
