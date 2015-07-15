'use strict';

var chronostore = require('./');
var chron = new chronostore({root:'./exa'});
var vinyl = require('vinyl');
var through2 = require('through2');

var file = new vinyl({
  path: 'tests.json',
  contents: new Buffer('{"foo":"barssss}"')
});
var input = through2.obj();
input.push(file);
input.push(null);

input.pipe(chron.write());