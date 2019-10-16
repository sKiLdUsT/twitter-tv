let mix = require('laravel-mix');

mix
  .js('./js/*.js', './public/assets/app.js')
  .js('./js/worker/*.js', './public/assets/worker.js')
  .sass('./scss/app.scss', './public/assets/')
