/*global it*/
"use strict";

var parser = require('../lib/parser'),
    fs = require('fs'),
    assert = require('assert'),
    fixtures = {
        S72: 'test/fixtures/S7.2_A1.1_T1.js',
        S11_4: 'test/fixtures/11.4.1-5-a-5gs.js'
    };

Object.keys(fixtures).forEach(function (k) {
    fixtures[k] = fs.readFileSync(fixtures[k], {encoding: 'utf-8'});
});

it('runs a test', function () {
    assert(true);
});

it('parses a fixture', function () {
    var file = {
        contents: fixtures.S72
    };
    file = parser.parseFile(file);

    assert.equal(file.attrs.es5id, '7.2_A1.1_T1');
});

it('parses a fixture with flags', function () {
    var file = {
        contents: fixtures.S11_4
    };
    file = parser.parseFile(file);

    assert.equal(file.attrs.flags.onlyStrict, true);
});

it('parses an empty file', function () {
    var file = {
        contents: ''
    };
    file = parser.parseFile(file);

    assert.deepEqual({
        contents: '', 
        attrs: {
            includes: [],
            flags: {}
        }
    }, file);
});

it('recovers from bad YAML', function () {
    var file = {
        file: 'mock_filename.js',
        contents: '/*---\n badYaml: value\ninsufficient_indent: value\nno_value:\n---*/'
    };
    file = parser.parseFile(file);
    // TODO: assert log (or exception)
});

// should be last test: ends stream (not repeatable)
it('provides a stream interface', function (done) {
    var processedCount = 0,
        file = {
            file: 'S72',
            contents: fixtures.S72
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
