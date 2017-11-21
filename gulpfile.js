'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const eslint = require('gulp-eslint')

// Define gulp tasks
gulp.task('js', () => {
  return gulp.src('js/*.js')
    .pipe(eslint.failAfterError())
    .pipe(babel({
      presets: ['es2015-without-strict']
    }))
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/assets'))
})

gulp.task('jsworker', () => {
  return gulp.src('js/worker/*.js')
    .pipe(eslint.failAfterError())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('worker.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('public/assets'))
})

gulp.task('scss', () => {
  return gulp.src('scss/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('public/assets'))
})

gulp.task('default', ['scss', 'js', 'jsworker'], () => {})
