'use strict';

var chai = require('chai');
chai.use(require('chai-things'));
var should = chai.should();
var sinon = require('sinon');
var fs = require('fs-extra');
var moment = require('moment');

var chronostore = require('../lib/chronostore');
var folder = './chronostore';
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
      root: './testing',
      format: ['YYYY']
    };
    chronostore.write(text, options, function(error, file) {
      var content = fs.readFileSync(file).toString();
      content.should.equal('foo bar');
      file.should.equal('./testing/1970/0000000000123-456.csv');
      fs.removeSync(options.root);
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

describe('reading', function() {

  beforeEach(function(done) {
    chronostore.write(json, {timestamp: 100}, function() {
      chronostore.write(json, {timestamp: 2000}, function() {
        chronostore.write(json, {timestamp: 30000}, function() {
          done();
        });
      });
    });
  });

  afterEach(function() {
    fs.removeSync(folder);
  });

  it('returns the filenames of target files', function(done) {
    chronostore.read(150, 5000, function(error, files) {
      files.length.should.equal(1);
      parseInt(files[0].name.slice(0,13)).should.equal(2000);
      done();
    });
  });

  it('returns other target files', function(done) {
    chronostore.read(150, 15000000, function(error, files) {
      files.length.should.equal(2);
      parseInt(files[0].name.slice(0,13)).should.equal(2000);
      parseInt(files[1].name.slice(0,13)).should.equal(30000);
      done();
    });
  });
});

describe('failing', function() {

  it('throws on file write failure', function(done) {
    sinon.stub(chronostore.fs, 'outputFile', function(file, content, callback) {
      return callback('Fake sinon error');
    });
    chronostore.write(text, function(error) {
      should.exist(error);
      error.should.equal('Fake sinon error');
      done();
    });
  });

  it('throws on wrong read options', function(done) {
    chronostore.read(150, 5000, {root: './foo'}, function(error) {
      should.exist(error);
      done();
    });
  });

});