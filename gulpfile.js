const gulp = require('gulp');
const less = require('gulp-less');

// Compile LESS files to CSS
gulp.task('less', function () {
    return gulp.src('src/less/**/*.less') // Adjust the path as needed
        .pipe(less())
        .pipe(gulp.dest('dist/css')); // Output directory
});

// Watch for changes in LESS files
gulp.task('watch', function () {
    gulp.watch('src/less/**/*.less', gulp.series('less'));
});

// Default task
gulp.task('default', gulp.series('less', 'watch'));
