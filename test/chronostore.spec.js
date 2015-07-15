'use strict';

var chai = require('chai');
chai.use(require('chai-things'));
var should = chai.should();
var sinon = require('sinon');
var through2 = require('through2');
var vinyl = require('vinyl');
var source = require('vinyl-source-stream');
var chronostore = require('../lib/chronostore');
var fs = require('vinyl-fs');
var tap = require('gulp-tap');

function logFile(file) {
  for (var property in file) {
    if (file.hasOwnProperty(property)) {
      console.log(property, file[property]);
    }
  }
}

describe('initialization', function() {

  it('tests', function(done) {
    var file = new vinyl({
      path: 'dummy.json',
      contents: new Buffer('{"dummy":"foo"}')
    });

    var incoming = through2.obj();
    incoming.push(file);
    incoming.push(null);

    var writer = through2.obj(function(obj, _, cb) {
      console.log('object', obj);
      return cb(null, obj);
    });

    var cs = new chronostore();
    var cs_writer = cs.write();

    incoming.pipe(cs_writer)
      .pipe(tap(function(obj) {
        console.log('doneeees');
        logFile(obj);
        done();
      }));
  });

});