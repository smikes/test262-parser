// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

var through = require('through'),
    yaml = require('js-yaml'),
    doneRegex = /\$DONE/;

function parseFile(file) {
    var start = file.contents.indexOf('/*---'),
        end;

    file.attrs = {};
    if (start > -1) {
        end = file.contents.indexOf('---*/');
        try {
            file.attrs = yaml.load(file.contents.substring(start + 2, end));
        } catch (e) {
            throw new Error("Exception reading file " + file.file + "\n" + e.message);
        }
    }

    file.attrs.flags = file.attrs.flags || [];
    file.attrs.flags = file.attrs.flags.reduce(function (acc, v) {
        acc[v] = true;
        return acc;
    }, {});
    file.attrs.includes = file.attrs.includes || [];

    file.async = doneRegex.test(file.contents);

    return file;
}

function throughParseFile(data) {
    try {
        this.queue(parseFile(data));
    } catch (e) {
        this.emit('error', e);
    }
}

module.exports = through(throughParseFile);
module.exports.parseFile = parseFile;
