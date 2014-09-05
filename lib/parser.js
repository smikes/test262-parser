// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

var fs = require('fs'),
    through = require('through'),
    yaml = require('js-yaml');

function parseFile(file) {
    var start = file.contents.indexOf('/*---'),
        end;

    file.attrs = {};
    if (start > -1) {
        end = file.contents.indexOf('---*/');
        try {
            file.attrs = yaml.load(file.contents.substring(start + 2, end));
        } catch (e) {
            console.log(e.message);
            console.log("Exception reading file " + file.file);
        }
    }

    file.attrs.flags = file.attrs.flags || [];
    file.attrs.flags = file.attrs.flags.reduce(function (acc, v) {
        acc[v] = true;
        return acc;
    }, {});
    file.attrs.includes = file.attrs.includes || [];

    return file;
}

module.exports = through(function (data) { this.queue(parseFile(data)); });
module.exports.parseFile = parseFile;

