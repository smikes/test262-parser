// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

var through = require('through'),
    yaml = require('js-yaml'),
    doneRegex = /\$DONE/;

function extractYAML(text) {
    var start = text.indexOf('/*---'),
        end;

    if (start > -1) {
        end = text.indexOf('---*/');
        return text.substring(start + 5, end);
    }

    return "";
}

function loadAttrs(file) {
    var y = extractYAML(file.contents);

    if (y) {
        try {
            return yaml.load(y);
        } catch (e) {
            throw new Error("Error loading frontmatter from file " + file.file + "\n" + e.message);
        }
    }

    return {};
}

function normalizeAttrs(attrs) {
    attrs.flags = attrs.flags || [];
    attrs.flags = attrs.flags.reduce(function (acc, v) {
        acc[v] = true;
        return acc;
    }, {});

    attrs.includes = attrs.includes || [];

    return attrs;
}

function parseFile(file) {
    file.attrs = normalizeAttrs(loadAttrs(file));

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
module.exports.extractYAML = extractYAML;
