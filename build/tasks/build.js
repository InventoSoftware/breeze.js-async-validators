'use strict';

import gulp from 'gulp';
import path from 'path';
import Builder from 'systemjs-builder';

// optional constructor options
// sets the baseURL and loads the configuration file
const builder = new Builder('./', './config.js');

builder.config({
    meta: {
        "npm:breeze-client@1.5.5/breeze.debug.js": {
            build: false
        }
    }
})

gulp.task('build', cb => {
    builder
        .bundle('index.js', 'dist/dist.js', { format: 'amd', minify: true })
        .then(function() {
            console.log('Build complete');
            cb();
        })
        .catch(function(err) {
            console.log('Build error');
            console.log(err);
            cb();
        });
})

