'use strict';

var nodeUuid = require('node-uuid');
var moment = require('moment');
var R = require('ramda');
var path = require('path');
var fs = require('fs-extra');
var chronostore = {
  fs: fs
};

var getWriteDefaults = function(options) {
  if (typeof options.timestamp !== 'object') {
    options.timestamp = moment(options.timestamp);
  }

  var defaults = {
    extension: '.txt',
    timestamp: moment(),
    uuid: nodeUuid.v1(),
    base: './storage',
    format: ['YYYY', 'MM', 'DD', 'HH']
  };
  return R.merge(defaults, options);
};

chronostore.write = function(content, options, callback) {
  var folder;
  var file;

  if (typeof options === 'function') {
    callback = options;
    options = getWriteDefaults({});
  } else {
    options = getWriteDefaults(options);
  }
  if (typeof content === 'object') {
    content = JSON.stringify(content);
    options.extension = '.json';
  }

  folder = R.reduce(function(string, elem) {
    string += '/' + options.timestamp.format(elem);
    return string;
  }, options.base, options.format);

  file = folder +
         '/' +
         options.timestamp +
         '-' +
         options.uuid +
         options.extension;

  fs.outputFile(file, content, function(error) {
    if (error) {
      return callback(error);
    } else {
      return callback(null, file);
    }
  });
};

chronostore.read = function(fromDate, toDate) {
};

chronostore.search = function(filename) {
};

module.exports = chronostore;