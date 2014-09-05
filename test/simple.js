/*global it*/
"use strict";

var parser = require('../lib/parser'),
    fs = require('fs'),
    assert = require('assert');

var S72 = fs.readFileSync('test/fixtures/S7.2_A1.1_T1.js', {encoding: 'utf-8'});

it('runs a test', function () {
    assert(true);
});

it('parses a fixture', function () {
    var file = {
        contents: S72
    };
    file = parser.parseFile(file);

    assert.equal(file.attrs.es5id, '7.2_A1.1_T1');
});

it('provides a stream interface', function (done) {
    var processedCount = 0,
        file = {
            file: 'S72',
            contents: S72
        };

    parser.on('data', function (f) {
        assert.equal(f.file, 'S72');
        assert.equal(f.attrs.es5id, '7.2_A1.1_T1');
        processedCount += 1;
    });
    parser.on('end', function () {
        assert.equal(processedCount, 1);
        done();
    });

    parser.write(file);
    parser.end();
});
