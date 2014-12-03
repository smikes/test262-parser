# Parse test262 test files

This package will allow you to parse [test262](https://github.com/tc39/test262/) test files into their component pieces, for further use and manipulation.

## API

### parseFile

The simplest function exported by this module is `parseFile`, which works like so:

```js
'use strict';
var fs = require('fs');
var test262Parser = require('test262-parser');

var testContents = fs.readFileSync('built-ins/Array/prototype/includes/array-like.js');

// Pass in file object and it will be mutated with parsed data:
var file = {
    file: 'built-ins/Array/prototype/includes/array-like.js',
    contents: testContents
};

test262Parser.parseFile(file);
// `file` now has `attrs` and `async` properties

console.log(file.attrs);
// Outputs normalized attributes from the YAML front-matter:
// https://github.com/tc39/test262/blob/master/CONTRIBUTING.md#frontmatter

console.log(file.async);
// Outputs `true` or `false` depending on whether the test is async:
// https://github.com/tc39/test262/blob/master/CONTRIBUTING.md#writing-asynchronous-tests

console.log(file.copyright);
// Outputs copyright header 
// https://github.com/tc39/test262/blob/master/CONTRIBUTING.md#copyright

console.log(file.testBody);
// Outputs the body of the test
// by convention, the body of the test begins after the '---*/' frontmatter closing comment


// You can also parse test contents directly; it will create a file object
var parsedFile = test262Parser.parseFile(testContents);

console.log(parsedFile.file);     // '<unknown>'
console.log(parsedFile.contents); // the same as `testContents`
console.log(parsedFile.attrs);    // the normalized attributes
consoel.log(parsedFile.async);    // whether or not the test is async
```

### extractYAML

The `extractYAML` function takes a string containing the text contents and returns back the substring that constitutes the YAML front matter:

```js
'use strict';
var fs = require('fs');
var test262Parser = require('test262-parser');

var testContents = fs.readFileSync('built-ins/Array/prototype/includes/array-like.js');

var yaml = test262Parser.extractYAML(testContents);
console.log(yaml);
```

will output

```
description: Array.prototype.includes works on array-like objects
author: Domenic Denicola
```

### Streaming interface

The default export of the module is a transform stream factory. Every time you write a string or file object to the transform stream, it emits a parsed file object:

```js
'use strict';
var fs = require('fs');
var test262Parser = require('test262-parser');

var transformStream = test262Parser();
transformStream.pipe(process.stdout);

var testContents = fs.readFileSync('built-ins/Array/prototype/includes/array-like.js');
transformStream.write(testContents);
```

will output to `process.stdout` the (stringification of the) file object.
