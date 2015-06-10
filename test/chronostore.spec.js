'use strict';

var chai = require('chai');
chai.use(require('chai-things'));
var should = chai.should();
var sinon = require('sinon');
var fs = require('fs-extra');
var moment = require('moment');

var chronostore = require('../lib/chronostore');
var folder = './storage';
var text = 'foo bar';
var json = {foo: 'bar'};

describe('initialization', function() {

  it('loads', function(done) {
    chronostore.should.have.property('write');
    chronostore.should.have.property('read');
    done();
  });

});

describe('writing', function() {

  it('writes with default options', function(done) {
    chronostore.write(text, function(error, file) {
      var content = fs.readFileSync(file).toString();
      content.should.equal('foo bar');
      fs.removeSync(folder);
      done();
    });
  });

  it('writes with custom options', function(done) {
    var options = {
      extension: '.csv',
      timestamp: 123,
      uuid: 456,
      base: './testing',
      format: ['YYYY']
    };
    chronostore.write(text, options, function(error, file) {
      var content = fs.readFileSync(file).toString();
      content.should.equal('foo bar');
      file.should.equal('./testing/1970/123-456.csv');
      fs.removeSync(options.base);
      done();
    });
  });

  it('writes with moment object', function(done) {
    var options = {
      timestamp: moment(123)
    };
    chronostore.write(text, options, function(error, file) {
      var content = fs.readFileSync(file).toString();
      content.should.equal('foo bar');
      fs.removeSync(folder);
      done();
    });
  });

  it('writes JSON', function(done) {
    chronostore.write(json, function(error, file) {
      var content = fs.readJsonSync(file);
      content.foo.should.equal('bar');
      fs.removeSync(folder);
      done();
    });
  });

});

describe('failing', function() {

  it('throws on file write failure', function(done) {
    sinon.stub(chronostore.fs, 'outputFile', function(file, content, callback) {
      return callback('Fake sinon error');
    });
    chronostore.write(text, function(error, file) {
      should.exist(error);
      error.should.equal('Fake sinon error');
      //fs.removeSync(folder);
      done();
    });
  });

});