/*global it*/
"use strict";

var parser = require('../lib/parser'),
    fs = require('fs'),
    assert = require('assert'),
    through = require('through'),
    fixtures = {
        S72: 'test/fixtures/S7.2_A1.1_T1.js',
        S11_4: 'test/fixtures/11.4.1-5-a-5gs.js',
        badYAML: 'test/fixtures/badYAML.js'
    };

Object.keys(fixtures).forEach(function (k) {
    /*jslint stupid:true*/
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
        contents: fixtures.badYAML
    };
    
    assert.throws(function () {
        file = parser.parseFile(file);
    },/YAML/);
});

it('sends an error event when the stream errors', function (done) {
    function f(i) {
        throw new Error('foo' + i);
    }

    var t = through(function (i) {
        try {
            f(i);
        } catch (e) {
            t.emit('error', e);
        }
    });
    t.on('error', function () {
        done();
    });

    t.write("thing");
    t.end();
});

// should be last test: ends stream (not repeatable)
it('provides a stream interface', function (done) {
    var counts = {
        processed: 0,
        error: 0
    };

    parser.on('data', function (f) {
        assert.equal(f.file, 'S72');
        assert.equal(f.attrs.es5id, '7.2_A1.1_T1');
        counts.processed += 1;
    });
    parser.on('error', function (e) {
        counts.error += 1;
    });
    parser.on('end', function () {
        assert.equal(counts.processed, 1);
        assert.equal(counts.error, 1);
        done();
    });

    parser.write({
            file: 'S72',
            contents: fixtures.S72
    });
    parser.write({ 
        file: 'badYAML.js',
        contents: fixtures.badYAML
    });
    parser.end();
});
