'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const runSequence = require('run-sequence')
const standard = require('gulp-standard')

// Builds the project.
gulp.task('build', function (done) {
  runSequence('lint', 'test', done)
})

// Lints the JavaScript files.
gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(standard())
    .pipe(standard.reporter('default', { breakOnError: true }))
})

// Runs the tests.
gulp.task('test', function () {
  return gulp.src(['**/*-spec.js', '!node_modules/**'])
    .pipe(mocha())
})
