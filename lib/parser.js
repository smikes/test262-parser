// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

var through = require('through'),
    yaml = require('js-yaml'),
    doneRegex = /\$DONE/;

function parseFile(file) {
    file.attrs = {};

    var y = extractYAML(file.contents);
    if (y) {
        try {
            file.attrs = yaml.load(y);
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

function extractYAML(text) {
    var start = text.indexOf('/*---'),
        end;

    if (start > -1) {
        end = text.indexOf('---*/');
        return text.substring(start + 5, end);
    }

    return "";
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
module.exports.extractYAML = extractYAML;
