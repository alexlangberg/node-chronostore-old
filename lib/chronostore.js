'use strict';

var nodeUuid = require('node-uuid');
var moment = require('moment');
var R = require('ramda');
var fs = require('fs-extra');
var readdirp = require('readdirp');
var chronostore = {
  fs: fs
};

var padTimestamp = function(timestamp) {
  return ('0000000000000' + timestamp + '').slice(-13);
};

var getWriteDefaults = function(options) {
  if (typeof options.timestamp !== 'object') {
    options.timestamp = moment(options.timestamp);
  }

  var defaults = {
    extension: '.txt',
    timestamp: moment(),
    uuid: nodeUuid.v1(),
    root: './chronostore',
    format: ['YYYY', 'MM', 'DD', 'HH']
  };
  return R.merge(defaults, options);
};

var getReadDefaults = function(options) {
  var defaults = {
    root: './chronostore',
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
  }, options.root, options.format);

  file = folder +
         '/' +
         padTimestamp(options.timestamp) +
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

chronostore.search = function(fromDate, toDate, options, callback) {
  var files = [];
  var stream;

  fromDate = parseInt(fromDate);
  toDate = parseInt(toDate);

  if (typeof options === 'function') {
    callback = options;
    options = getReadDefaults({});
  } else {
    options = getReadDefaults(options);
  }

  stream = readdirp({root: options.root});
  stream.on('data', function(entry) {
    var timestamp = parseInt(entry.name.slice(0, 13));
    if (fromDate <= timestamp && timestamp <= toDate) {
      files.push({
        timestamp: timestamp,
        name: entry.name,
        parentDir: entry.parentDir
      });
    }
  }).on('error', function(error) {
    return callback(error);
  }).on('end', function() {
    return callback(null, files);
  });
};

chronostore.read = function(path, options, callback) {
  var filePath;

  if (typeof options === 'function') {
    callback = options;
    options = getReadDefaults({});
  } else {
    options = getReadDefaults(options);
  }

  filePath = options.root + '/' + path;

  if (typeof path === 'object') {
    filePath = options.root + '/' + path.parentDir + '/' + path.name;
  }

  fs.readFile(filePath, function(error, data) {
    var result = data.toString();
    if (filePath.slice(-4) === 'json') {
      result = JSON.parse(result);
    }
    return callback(null, result);
  });
};

module.exports = chronostore;