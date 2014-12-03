// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

var through = require('through'),
    yaml = require('js-yaml'),
    doneRegex = /\$DONE/;

/**
 * @module Test262Parser
 */

/**
 * @class Test262File
 */
/**
 * filename
 * @property {string} file
 */
/**
 * original file contents
 * @property {string} contents
 */
/**
 * parsed, normalized attributes
 * @property {Test262FileAttrs} attrs
 */

/**
 * @class Test262FileAttrs
 */
/**
 * list of harness files to include
 * @attribute {Array} includes
 */
/**
 * test flags; valid values include:
 *   - onlyStrict
 *   - noStrict
 * @attribute {Object} flags
 */
/**
 * author name
 * @attribute {String} author
 * @optional
 */

/**
 * @class Test262Parser
 */

/**
 * Normalize a potential string into a file object
 * @method normalizeFile
 * @param {Test262File|string} file - file object or a string to convert into one
 * @return {Test262File} the file object if passed, or a Test262File with filename '<unknown>' if passed a string
 * @private
 */
function normalizeFile(file) {
    if (typeof file === 'string') {
        return { file: '<unknown>', contents: file };
    }
    return file;
}

/**
 * Extract YAML frontmatter from a test262 test
 * @method extractYAML
 * @param {string} text - text of test file
 * @return {string} the YAML frontmatter or empty string if none
 * @private
 */
function extractYAML(text) {
    var start = text.indexOf('/*---'),
        end;

    if (start > -1) {
        end = text.indexOf('---*/');
        return text.substring(start + 5, end);
    }

    return "";
}

/**
 * Extract and parse frontmatter from a test
 * @method loadAttrs
 * @param {Test262File} file - file object
 * @return {Object} - raw, unnormalized attributes
 * @private
 */
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

/**
 * Normalize attributes; ensure that flags, includes exist
 *
 * @method normalizeAttrs
 * @param {Object} attrs raw, unnormalized attributes
 * @return {Test262FileAttrs} normalized attributes
 * @private
 */
function normalizeAttrs(attrs) {
    attrs.flags = attrs.flags || [];
    attrs.flags = attrs.flags.reduce(function (acc, v) {
        acc[v] = true;
        return acc;
    }, {});

    attrs.includes = attrs.includes || [];

    return attrs;
}

/**
 * Parse a test file:
 *  - identify and parse frontmatter
 *  - set up normalized attributes
 *
 * @method parseFile
 * @param {Test262File|string} file - file object (only name, contents expected) or contents string
 * @return {Test262File} file object with attrs, async added
 * @throws Error if error parsing YAML
 */
function parseFile(file) {
    file = normalizeFile(file);

    file.attrs = normalizeAttrs(loadAttrs(file));

    file.async = doneRegex.test(file.contents);

    return file;
}

/**
 * Adapter function to provide a stream interface
 *  - file object is read from input stream
 *  - use `parseFile` to parse front matter
 *  - successfully parsed files are queued to output stream
 *  - errors are emitted as 'error' events
 *
 * @method throughParseFile
 * @param {Test262File} file - file object (only name, contents expected)
 */
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
