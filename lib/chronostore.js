'use strict';

//var moment = require('moment');
//var map = require('map-stream');
//var uuid = require('node-uuid');
//var R = require('ramda');
var through2 = require('through2');
var fs = require('vinyl-fs');
var rename = require('gulp-rename');
var gzip = require('gulp-gzip');

function Chronostore(options) {
  if (!(this instanceof Chronostore)) {
    return new Chronostore(options);
  }

  //this.options = R.merge({
  //  root: './chronostore',
  //  structure: ['YYYY', 'MM', 'DD', 'HH'],
  //  gzip: false
  //}, options);
}

Chronostore.prototype.write = function() {
  return through2.obj()
    .pipe(gzip())
    //.pipe(rename(fileRename))
    .pipe(fs.dest('./fsout'));
};


module.exports = Chronostore;
